import queueSend from './queue.send';
import Tool from './tool';

class Http {

  constructor(options) {
    this.url = options.url;
    this.formData = Tool.deepClone(options.formData, {});
    this.headers = Tool.deepClone(options.headers || {}, {});
    this.fileData = options.fileData || {};
    this.callBack = options.callBack || {};
    this.sliceTryFreq = options.sliceTryFreq;
    this.isCheckMd5Request = options.isCheckMd5Request || false;
    this.delay = options.delay;
  }


  send() {
    let nowUploadKey = null;
    if (this.fileData.fieldName) {
      // 当前发送的key
      nowUploadKey = this.fileData.fieldName;
    }


    // 追加到队列
    queueSend.queue.push({
      delay: this.delay,
      // 本次请求切片所属字段
      fieldName: this.fileData.fieldName,
      // 本次请求切片在文件的第几块
      order: this.fileData.order || '',
      trySend: 0,
      // 最大限度每个切片允许上传失败次数
      maxTrySend: this.sliceTryFreq,
      isCheckMd5Request: this.isCheckMd5Request,
      cancelSend: (isCheckMd5Request) => {
        if (isCheckMd5Request) {
          this.callBack.checkMd5Result &&
          this.callBack.checkMd5Result({
            httpStatus: queueSend.lastHttpStatus,
            response: null
          });

        } else {
          // 取消本文件的所以切片上传
          queueSend.removeField(this.fileData.fieldName);
          this.callBack.tryFreqError &&
          this.callBack.tryFreqError({
            httpStatus: queueSend.lastHttpStatus,
            fieldName: this.fileData.fieldName, // 字段名称
            order: this.fileData.order // 在第几块一直失败
          });
        }

      },

      // 队列执行函数
      fn: () => {
        let formData = new FormData();
        let xhr = new XMLHttpRequest();
        //
        let url = this.url;
        if (/\?/.test(url)) {
          url = url + '&upload-random=' + Tool.makeRandom();
        } else {
          url = url + '?upload-random=' + Tool.makeRandom();
        }
        xhr.open('post', url, true);
        // 循环追加数据
        for (let key in this.formData) {
          formData.append(key, this.formData[key]);
        }
        // 循环追加请求头
        for (let key in this.headers) {
          xhr.setRequestHeader(key, this.headers[key]);
        }

        if (nowUploadKey) {
          // 追加文件
          formData.append(this.fileData.fieldName/*file key*/,
            this.fileData['file']['blob']/*blob*/,
            this.fileData['fileName']/*file name*/);
        }


        // 监听状态改变
        xhr.onreadystatechange = () => {

          if (xhr.readyState === 4 && xhr.status === 200) {
            // 返回200，表示一个文件请求成功，通知删除该请求队列
            queueSend.sendSuccess();
            this.callBack.singleSuccess && this.callBack.singleSuccess({
              field: this.fileData.fieldName,
              status: xhr.status,
              response: xhr.responseText
            });
            try {
              // 是否是校验md5请求
              if (this.isCheckMd5Request) {
                this.callBack.checkMd5Result &&
                this.callBack.checkMd5Result({
                  httpStatus: queueSend.lastHttpStatus,
                  response: typeof xhr.responseText === 'string' ? JSON.parse(xhr.responseText) : xhr.responseText
                });
              }
            } catch (e) {
              throw new Error(e.toString());
            }

          }

          if (xhr.readyState === 4 && xhr.status === 206) {
            // 返回206，表示一块切片请求成功，通知删除该请求队列
            queueSend.sendSuccess();
            this.callBack.sliceSuccess && this.callBack.sliceSuccess({
              status: xhr.status,
              response: xhr.responseText
            });
          }
          // 请求完成，继续下一次请求，如果后台报非200 || 206则没有通知上传成功，会继续发送上一次请求
          if (xhr.readyState === 4) {
            // 保存最后一次HTTP状态码
            queueSend.lastHttpStatus = xhr.status;
            queueSend.isSendLoading = false;
            queueSend.send();
          }

        };
        // 监听进度
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {

            // this.callBack.progress && this.callBack.progress(Math.round(evt.loaded / evt.total * 100));
            this.callBack.progress
            && this.callBack.progress(
              {[nowUploadKey]: evt.loaded}
            );
          }
        };
        xhr.send(formData);
      }
    });
    queueSend.send();
  }
}


export default Http;





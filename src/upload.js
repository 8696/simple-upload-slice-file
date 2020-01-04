import Slice from './slice';

import Tool from './tool';

import Http from './http';

import getFileMd5 from './getMd5';


class UploadFile {

  constructor(options) {

    // 切片的大小数
    this.chunkSile = options.chunkSile || 10;
    // 请求地址
    this.url = options.url || 'http://127.0.0.1';
    // 请求数据
    this.formData = {};
    // 请求文件
    this.formSleceFile = [];

    // 请求头
    this.headers = {};
    // 回调
    this.callBack = options.callBack || {};
    // 一个切片连续上传几次失败直接断开整个文件上传
    this.sliceTryFreq = options.sliceTryFreq || 10;
    // 是否最后发送MD5值进行校验
    this.isSendCheckMd5 = options.isSendCheckMd5 || false;

    this.delay = options.delay || 0;
  }

  /**
   * @description 追加请求头
   * @param headers {Object} 请求头对象
   * @return {Object} this
   * */
  appendHeader(headers) {
    Object.assign(this.headers, headers);
    return this;
  }

  /**
   * @description 追加请求携带数据
   * @param datas {Object}
   * @return object this
   * */
  appendData(datas) {
    Object.assign(this.formData, datas);
    return this;
  }

  /**
   * @description 追加请求文件数据
   * @param files {Object}
   * @return object this
   * */
  appendFile(files) {

    // 将文件集合切片放入本对象fromFile
    for (let key in files) {
      let file = null;
      if (!files[key]) {
        throw new Error('No correct file was selected');
      } else if (files[key].nodeType === 1) {
        file = files[key]['files'][0];
      } else if (typeof jQuery !== 'undefined' && files[key] instanceof jQuery) {
        file = files[key][0]['files'][0];
      } else if (files[key] instanceof FileList) {
        file = files[key][0];
      } else if (files[key] instanceof File) {
        file = files[key];
      }

      // 实例化切片对象，将文件进行切片、计算等操作
      let slice = new Slice({
        chunkSile: this.chunkSile,
        file: file
      });


      // 将文件所有切片存入切片集合
      this.formSleceFile[key] = {
        totalSize: file.size,
        fileName: file['name'],
        // fileKey: Tool.makeRandom() + '.' + Tool.getFileNameSuffix(files[key]['name']),
        fileKey: Tool.makeRandom(),
        slices: slice.getSlice(),
        primordial: file
      };

    }

    return this;

  }

  send() {

    // #a001 上传的所有字段放在数组里面
    let allField = Object.keys(this.formSleceFile);
    // #b001 将进度回调的所有字段名称、回调格式定好
    let progressCallObj = {
      /* fieldName: {
           totalSize: 0,
           fileName: '',
           fileKey: '',
           chunkLength: 0
       }
       */
    };

    // #c001 将获取成功的MD5回到
    let md5CallObj = {};

    // #d001 将每次单文件上传完成的响应存起来
    let allSuccessResult = [];
    // 多文件
    for (let key in this.formSleceFile) {
      // 单个文件
      let singleFile = this.formSleceFile[key],
        // 单个文件总共已经上传的字节
        singleLoadedTotal = 0,
        // 临时记录本次与上次的相隔的大小
        s = 0;
      // 进度回调参数
      progressCallObj[key] = {
        totalSize: singleFile['totalSize'],
        fileName: singleFile['fileName'],
        fileKey: singleFile['fileKey'],
        chunkLength: singleFile['slices'].length,
        loadedTotalSize: 0
      };
      // 获取文件MD5
      md5CallObj[key] = {
        field: key,
        fileKey: singleFile['fileKey'],
        fileName: singleFile['fileName'],
        md5: null
      };
      if (this.isSendCheckMd5) {
        getFileMd5({
          file: singleFile['primordial'],
          success: (res) => {
            // console.log('md5md5md5md5');
            md5CallObj[key].md5 = res.md5;
            // 全部获取成功才进行回调
            let is = true;
            for (let key in md5CallObj) {
              if (!md5CallObj[key].md5) {
                is = false;
              }
            }
            if (is) {
              this.callBack.getFileMd5 &&
              this.callBack.getFileMd5(md5CallObj);
              // 发送md5校验

              let md5Header = [];
              for (let key in md5CallObj) {
                md5Header.push({
                  'upload-file-id': md5CallObj[key]['fileKey'],
                  md5: md5CallObj[key]['md5'],
                  suffix: Tool.getFileNameSuffix(md5CallObj[key]['fileName'])
                });
              }
              new Http({
                callBack: {
                  checkMd5Result: (resp) => {
                    this.callBack.checkMd5Result &&
                    this.callBack.checkMd5Result(resp);
                  }
                },
                sliceTryFreq: this.sliceTryFreq,
                url: this.url,
                isCheckMd5Request: true,
                headers: {
                  'upload-file-md5': JSON.stringify(md5Header)
                },
                formData: {
                  'upload-file-md5': JSON.stringify(md5Header)
                }

              }).send();
            }
          },
          progress(res) {
            // console.log(res);
          },
          complete(res) {
            // console.log(res);
          },
          error: function (res) {
            // console.log(res);
          }
        });
      }

      // 多切片,循环将切片加入请求队列
      for (let i = 0; i < singleFile['slices'].length; i++) {
        // console.log(singleFile['slices'][i]);
        // 与切片上传所需请求头合并
        this.headers = Object.assign(this.headers, {
          // 该段起始位置-结束位置
          'upload-size-range': singleFile['slices'][i].start + '-' + singleFile['slices'][i].end,
          // 总大小
          'upload-total-size': singleFile.totalSize,
          // 总共所需上传次数
          'upload-total-slice': singleFile['slices'].length,
          // 当前是第几块
          'upload-now-order': i + 1,
          // 当前前端上传key
          'upload-file-id': singleFile['fileKey']
        });

        new Http({
          callBack: {
            // 每个切片实时上传回调
            progress: progress => {
              if (singleLoadedTotal === 0) {
                // 如果第一次为0，直接等于
                singleLoadedTotal = progress[key];
              } else {
                // e加等于本次实时减去上一次结束的
                singleLoadedTotal += progress[key] - s;
              }

              // #b002 将文件实时上传情况回调
              progressCallObj[key].loadedTotalSize = singleLoadedTotal;

              this.callBack.progress &&
              /*浏览器打印对象时如果对象未展开，由于对象引用问题，
              最后展开会导致显示不准确，所以采用深拷贝解决，更利于调试*/
              this.callBack.progress(Tool.deepClone(progressCallObj, {}));

              // 记录上一次结束的
              s = progress[key];
            },
            // 一个文件(全部切片)上传成功回调
            singleSuccess: resp => {
              try {
                this.callBack.singleSuccess &&
                this.callBack.singleSuccess({
                  field: resp.field,
                  response: typeof resp.response === 'string' ? JSON.parse(resp.response) : resp.response
                });

                // #d002
                allSuccessResult.push({
                  field: resp.field,
                  response: typeof resp.response === 'string' ? JSON.parse(resp.response) : resp.response
                });

                // #a002 判断是否全部上传完成
                for (let k = 0; k < allField.length; k++) {
                  if (key === allField[k]) {
                    // 上传一个移除
                    allField.splice(k, 1);
                    break;
                  }
                }
                if (allField.length === 0) {
                  // #a003
                  this.callBack.allSuccess &&
                  this.callBack.allSuccess(allSuccessResult);
                }
              } catch (e) {
                throw new Error(e.toString());

              }


            },
            // 一块切片上传成功回调
            sliceSuccess() {
              // 一块上传完成重置临时记录的大小
              s = 0;
            },
            error(resp) {
              console.log(resp);
            },
            // 某个文件由于某个切片上传连续失败回调
            tryFreqError: errorMsg => {

              this.callBack.tryFreqError &&
              this.callBack.tryFreqError(errorMsg);
            }
          },
          url: this.url,
          sliceTryFreq: this.sliceTryFreq,
          headers: this.headers,
          formData: this.formData,
          fileData: {
            fieldName: key,
            fileName: singleFile['fileName'],
            fileKey: singleFile['fileKey'],
            file: singleFile['slices'][i],
            order: i
            //
            // [key]: {
            //     fileName: singleFile['fileName'],
            //     fileKey: singleFile['fileKey'],
            //     file: singleFile['slices'][i]
            // }
          },
          delay: this.delay
        }).send();
      }


    }

  }


}


export default UploadFile;


















/**
 * Created by WebStorm
 * Description: next..
 * User: JinwenLong
 * Author: longjinwen
 * Email: 204084802@qq.com
 * Date: 2020/1/4
 * Time: 3:40 下午
 */
import Tool from './tool';

class Http {
  constructor(options) {
    this.url = options.url;
    this.formData = Tool.deepClone(options.formData, {});
    this.header = Tool.deepClone(options.header || {}, {});
    this.file = options.file || {fieldName: String, fileBlob: Object, fileName: String};
    this.delay = options.delay;
  }

  request(callBack) {
    let xhr = new XMLHttpRequest();
    let formData = new FormData();
    xhr.open('post', this.url, true);
    // 循环追加请求头
    for (let key in this.header) {
      if (this.header.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, this.header[key]);
      }
    }
    // 循环追加数据
    for (let key in this.formData) {
      if (this.formData.hasOwnProperty(key)) {
        formData.append(key, this.formData[key]);
      }
    }

    // 追加文件
    formData.append(this.file.fieldName, this.file.fileBlob, this.file.fileName);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        callBack.response(xhr);
      }
    };
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        callBack.progress(evt.loaded, evt.total);
      }
    };
    xhr.send(formData);
  }

}

export default Http;

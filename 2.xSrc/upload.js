/**
 * Created by WebStorm
 * Description: next..
 * User: JinwenLong
 * Author: longjinwen
 * Email: 204084802@qq.com
 * Date: 2020/1/4
 * Time: 3:41 下午
 */
import Http from './http';
import Queue from './queue';
import Slice from './slice';
import Tool from './tool';
import getFileMd5 from './get-md5';

const url = require('url');
const querystring = require('querystring');

class Upload {

  /**
   * @description options
   * @param options {Object}
   * */
  constructor(options) {

    this.url = options.url;
    this.header = {};
    this.formData = {};
    this.delay = options.delay || 0;
    this.chunkSile = options.chunkSile || 10;
    this.file = {
      fieldName: String,
      fileBlob: Object,
      fileName: String
    };
    this.callBack = {
      progress: Function,
      sliceResponse: Function,
      lastResponse: Function
    };

  }


  /**
   * @description 追加请求头
   * @param header {Object}
   * @return this
   * */
  appendHeader(header) {
    this.header = Object.assign(this.header, header);
    return this;
  }

  /**
   * @description 追加数据
   * @param formData {Object}
   * @return this
   * */
  appendData(formData) {
    this.formData = Object.assign(this.formData, formData);
    return this;
  }


  /**
   * @description 添加文件
   * @param fieldName {String} 字段名称 2.x 中使用单文件上传
   * @param file {File}
   * @return this
   * */
  addFile(fieldName, file) {
    let fileBlob = Upload.parseFileBlob(file);

    this.file.fieldName = fieldName;
    this.file.fileBlob = fileBlob;
    this.file.fileName = fileBlob.name;
    return this;
  }

  /**
   * @description 添加回调
   * @return this
   * */
  addCallBack(callback) {
    this.callBack.progress = callback.progress || null;
    this.callBack.sliceResponse = callback.sliceResponse || null;
    this.callBack.lastResponse = callback.lastResponse || null;

    return this;
  }

  /**
   * @description 提交数据
   * @return {Promise}
   * */

  send() {
    // 切片
    let slice = new Slice({
      chunkSile: this.chunkSile,
      file: this.file.fileBlob
    });
    // 队列
    let queue = new Queue();
    // url 对象
    let urlObject = url.parse(this.url);
    // 任务 ID
    let taskId = Tool.makeRandom();
    // 切片集合
    let fileSlices = slice.getSlice();
    // 已经上传的大小
    let progress = [];

    fileSlices.forEach((item, index) => {
      progress[index] = 0;
      queue.push2queue((next) => {

        let url = urlObject.protocol + '//' + urlObject.host + urlObject.pathname;
        let query = querystring.decode(urlObject.query);
        let taskParam = {
          'task-order': index + 1,
          'task-size-range': item['start'] + '-' + item['end'],
          'task-total-slice': fileSlices.length,
          'task-total-size': slice.getSize(),
          'task-id': taskId,
          'task-size': item.size
        };
        query = Object.assign(query, taskParam);

        let http = new Http({
          url: url + '?' + querystring.stringify(query),
          formData: this.formData,
          header: this.header,
          file: {
            fieldName: this.file.fieldName,
            fileBlob: item.blob,
            fileName: this.file.fileName
          }
        });

        setTimeout(() => {
          http.request({
            response: (xhr) => {
              // 单切片响应
              if (typeof this.callBack.sliceResponse === 'function') {
                this.callBack.sliceResponse(xhr, Tool.deepClone(taskParam, {}), queue);
              }
              // 所有切片完成响应
              if (index + 1 === fileSlices.length
                && typeof this.callBack.lastResponse === 'function'
              ) {
                this.callBack.lastResponse(xhr, Tool.deepClone(taskParam, {}));
              }
            },
            progress: (loaded) => {
              progress[index] = loaded;
              let p = progress.reduce((a, b) => {
                return a + b;
              }) / slice.getSize();
              if (typeof this.callBack.progress === 'function') {
                this.callBack.progress(p > 1 ? 1 : p);
              }
            }
          });
        }, this.delay);

      });
    });


  }

  /**
   *
   * */
  static parseFileBlob(file) {
    if (file.nodeType === 1) {
      return file['files'][0];
    }
    if (typeof jQuery !== 'undefined' && file instanceof jQuery) {
      return file[0]['files'][0];
    }
    if (file instanceof FileList) {
      return file[0];
    }
    if (file instanceof File) {
      return file;
    }

  }

  /**
   * @description 获取文件md5
   * */
  static getMD5(options) {
    options.file = Upload.parseFileBlob(options.file);
    return getFileMd5(options);
  };

}

export default Upload;




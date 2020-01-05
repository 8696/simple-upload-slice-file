# Simple upload slice file


#### 项目介绍

一款前端简单的分片上传文件小项目，不依赖jQuery，解决大文件上传过久，网络不稳定导致前功尽弃的问题。支持如下：
 - 设置切片大小
 - 进度计算
 - 队列提交
 - 队列控制 
 - MD5校验
 - IE10及其他主流浏览器(因使用原生FormData对象)
 

 #### 历史版本
 [1.x](https://github.com/8696/simple-upload-slice-file/tree/1.x)

#### 安装

##### (c)npm install simple-upload-slice-file -D


#### 使用

##### Browser
```javascript
    <script src="dist/simple-upload-slice-file.min.js"></script>

    new SimpleUploadSliceFile({
      //
      url: 'http://127.0.0.1:3000/upload',
      // 队列延迟发送，可用于调试，默认0(ms)
      delay: 0,
      // 切片大小(M)，建议不要太小,默认10
      chunkSile: 20,
    })
      .appendHeader({
        header1: 'header 1',
      })
      .appendHeader({
        header2: 'header 2',
      })
      .appendData({
        data1: 'data 1',
      })
      .appendData({
        data2: 'data 12',
      })
      .addFile('file', document.querySelector('#file'))
      // .addFile('file', document.querySelector('#file')['files'])
      // .addFile('file', $('#file'))
      // .addFile('file', document.querySelector('#file')['files'][0])
      .addCallBack({
        // 上传进度
        progress: function (progress) {
          console.log('上传进度：' + progress);
        },
        // 每个切片完成后的回调,2.x由手动判断是否允许下一块进行提交，增加了灵活性
        sliceResponse: function (xhr, taskParam, queue) {
          // 原生 xhr 对象，根据对象信息判断是否进行下一个队列，status为4才回调
          // console.log('xhr');
          // console.log(xhr);
          // 任务参数
          // console.log('taskParam');
          // console.log(taskParam);
          // console.log('queue');
          // console.log(queue);
          // queue 使用方法 https://github.com/8696/js-queue
          // 例1：
          if (xhr.status === 200) {
            var responseData = typeof xhr.responseText === 'string' ? JSON.parse(xhr.responseText) : xhr.responseText;
            if (responseData.code === 0) {
              // 继续提交
              queue.next();
            } else {
              // 重新提交当前块
              queue.again();
            }
          } else {
            // 重新提交当前块
            queue.again();
          }
        },
        // 队列中的最后一次响应
        lastResponse: function (data, taskParam) {
          console.log(data);
        }
      })
      .send();

    // 获取 MD5
    SimpleUploadSliceFile.getMD5({
      // file: $('#file'),
      // file: document.querySelector('#file'),
      // file:document.querySelector('#file')['files'],
      file: document.querySelector('#file')['files'][0],
      success: function (res) {
        console.log('md5：');
        console.log(res);
      },
      progress: function (res) {
        // console.log(res);
      },
      complete: function (res) {
        // console.log(res);
      },
      error: function (res) {
        // console.log(res);
      }
    });

```
##### vue
```javascript

    import SimpleUploadSliceFile from 'simple-upload-slice-file';
    
    new SimpleUploadSliceFile.addFile().send();

```





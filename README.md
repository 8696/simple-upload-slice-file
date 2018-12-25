# Simple upload slice file

#### 项目介绍

一款前端简单的分片上传文件小项目，不依赖jQuery，解决大文件上传过久，网络不稳定导致前功尽弃的问题。支持如下：
 - 设置切片大小
 - 错误重传
 - 进度计算
 - 队列提交
 - 各种回调 
 - MD5校验
 - IE10及其他主流浏览器(因使用原生FormData对象)
 

#### 安装

1. (c)npm install simple-upload-slice-file -D


#### 使用

1. dist目录下提供了前端提交和php演示文件。具体查看demo

##### Browser
```javascript
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title></title>
    </head>
    <body>
    <div>
        <input type="file" class="file1" name="" id="file1">
        <input type="file" class="file2" name="" id="file2">
        <input type="file" class="file3" name="" id="file3">
        <button onclick="upload()">发送</button>
    </div>
    
    <script src="dist/simple-upload-slice-file.min.js"></script>
    <script>
        function upload() {
    
            new SimpleUploadSliceFile({
                url: 'http://127.0.0.1:11005/php/upload.php',
                // 队列延迟发送，可用于调试，默认0(ms)
                delay: 0,
                // 切片大小(M)，建议不要太小,默认10
                chunkSile: 10,
                // 一块切片连续上传失败数即终止该文件上传,默认10
                sliceTryFreq: 3,
                // 是否全部上传完毕发送MD5校验,默认false
                isSendCheckMd5: true,
                // 开启校验MD5之后，会在最后队列末尾发送一个请求，参数如下
                /*
                    分别在请求头和请求体中携带‘upload-check-md5’,值类型为json
                    [
                        {
                            "upload-file-id":"SGf0ziqCvO31WpGzwQVJ1542616176023",
                            "md5":"17fffaa02b0b30be96db75fd58f8d21d",
                            "suffix":"mp4"
                        },
                        ...
                    ]
                * */
    
                callBack: {
                    // 上传进度回调
                    progress: function (res) {
                        // console.log(res);
                        for (var key in res) {
                            console.log('字段：' + key + '进度：' + parseInt(res[key].loadedTotalSize
                                / res[key].totalSize * 100));
                        }
                    },
                    // 一个文件上传成功回调
                    singleSuccess: function (res) {
                        console.log('一个文件上传成功');
                        console.log(res);
                    },
                    // 全部上传成功回调
                    allSuccess: function (res) {
                        console.log('全部上传完成');
                        console.log(res);
                    },
                    // 某个文件由于某个切片上传连续失败回调
                    tryFreqError: function (err) {
                        console.log('某个文件由于某个切片上传连续失败回调');
                        console.log(err);
                    },
                    // 获取文件MD5,如果未开启MD5校验,该回调则不执行
                    getFileMd5: function (res) {
                        console.log('md5值');
                        console.log(res);
                    },
                    // 后端校验MD5结果,如果未开启MD5校验,该回调则不执行
                    checkMd5Result: function (res) {
                        console.log('MD5校验结果');
                        console.log(res);
                    }
                }
            }).appendHeader({ // 添加请求头参数
                time: '123456789',
                time2: '123456789'
            }).appendData({ // 添加请求体参数
                username: 'longjinwen',
                age: 1
            }).appendFile({ // 添加文件 支持格式如下
    
                // music: $('#file1'),  // jq对象，取第0个
                // music: document.getElementById('file1'),  // 原生dom对象,在获取FileList对象时,取第0个
                // music: document.getElementById('file1').files, // 原生FileList对象 ,取第0个
                // music: document.getElementById('file1').files[0], // 原生File对象
    
                music: document.getElementById('file1').files[0],
    
                music2: document.getElementById('file2').files[0],
                music3: document.getElementById('file3').files[0],
            }).send();
    
    
        }
        /**
         * 1、完整演示内容如上
         *
         * 2、在提交中前端会自动添加以下请求头，用户标识前端目前发送文件的状态
         *      upload-file-id -> 该文件的唯一标识
         *      upload-total-size -> 该文件总大小
         *      upload-total-slice -> 该文件总共被切成了几块
         *      upload-now-order -> 当前所传输的第几块切片
         *      upload-size-range -> 正在提交的当前切片在文件里的大小所在区间
         *
         * 3、在提交文件的过程中，后端需返回 status code 如下
         *      206 -> 表示该文件还没提交完成,后端根据响应头发的信息进行判断是否是最后一次提交
         *      200 -> 表示一个文件提交完成
         *      非以上 -> 一个切片如果上传超过指定次数，会终止该文件的提交，下一个文件的切片将不会终止
         *
         * 4、如果开启了MD5校验，那么在全部提交完成之后，会再发一个请求将md5值提交给后端，
         *      在请求头和请求体中均会带 upload-file-md5 一个参数，如demo所示
         *
         *
         *
         *
         *
         *
         *
         * */
    
    
    </script>
    
    
    </body>
    </html>

```
##### vue
```javascript
    // main.js
    import SimpleUploadSliceFile from 'simple-upload-slice-file';
    
    Vue.prototype.SimpleUploadSliceFile = SimpleUploadSliceFile;
    


    // component
    new this.SimpleUploadSliceFile().appendHeader().appendData().appendFile().send();

```





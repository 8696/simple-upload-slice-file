/**
 * Created by WebStorm
 * Description: next..
 * User: JinwenLong
 * Author: longjinwen
 * Email: 204084802@qq.com
 * Date: 2020/1/4
 * Time: 3:32 下午
 */
const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const koaBody = require('koa-body');
const mimeTypes = require('mime-types');
const makeDir = require('make-dir');
const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');
const crypto = require('crypto');
const staticFiles = require('koa-static');

app.use(koaBody({
  multipart: true
}));

app.use(staticFiles(path.resolve(__dirname, '../dist')));


app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', '*');
  ctx.set('Access-Control-Allow-Headers', '*');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method === 'OPTIONS') {
    ctx.body = '';
  } else {
    await next();
  }
});

async function sleep() {
  return new Promise(resolve => {
    setTimeout(function () {
      resolve();
    }, 500);
  });
}

async function getFileMd5(file) {
  return new Promise((resolve, reject) => {
    const st = fs.createReadStream(file);
    const fsHash = crypto.createHash('md5');
    st.on('data', (d) => {
      fsHash.update(d);
    });
    st.on('end', () => {
      resolve(fsHash.digest('hex'));
    });

  });
}

router.post('/upload', async (ctx) => {

  await sleep();
  // console.log(ctx.request.files.file);
  // console.log(ctx.request.body);
  // console.log(ctx.request.query);
  // 创建该任务文件夹
  let taskDir = await makeDir(path.resolve(__dirname, './upload/' + ctx.request.query['task-id']));
  // 保存文件
  // const suffix = mimeTypes.extension(ctx.request.files.file.type);
  const suffix = ctx.request.files.file.name.split('.').length > 1 ?
    '.' + ctx.request.files.file.name.split('.').pop() : '';
  // console.log(ctx.request.files.file.path)
  await fsExtra.copy(ctx.request.files.file.path,
    path.resolve(taskDir, ctx.request.query['task-order'] + suffix));

  // 最后一次提交
  if (Number(ctx.request.query['task-total-slice']) === Number(ctx.request.query['task-order'])) {
    // 合并(也可以每次提交在进行合并)
    let newFile = path.resolve(taskDir, ctx.request.query['task-id'] + suffix);

    fs.readdirSync(taskDir).forEach(fileName => {
      let filePath = path.resolve(taskDir, fileName);
      console.log(filePath);
      //
      fs.appendFileSync(newFile, fs.readFileSync(filePath));
      fs.unlinkSync(filePath);
    });
    let md5 = await getFileMd5(newFile);
    console.log('md5：' + md5);
    return ctx.body = {code: 0, data: {md5, done: true, order: ctx.request.query['task-order']}};
  }

  // ctx.status = 206;
  ctx.body = {code: 0, data: {done: false, order: ctx.request.query['task-order']}};

});

app.use(router.routes());
app.listen(3000);

console.log('http://localhost:3000/');





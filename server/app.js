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

router.post('/upload', async (ctx) => {
  ctx.body = '首页';
});
app.use(router.routes());
app.listen(3000);






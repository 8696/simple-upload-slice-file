export default {
  isSendLoading: false,
  queue: [],
  lastHttpStatus: 0,
  send: function () {
    if (!this.isSendLoading) {
      if (this.queue.length > 0) {
        this.isSendLoading = true;
        setTimeout(() => {
          this.queue[0].trySend++;
          // 判断一块切片是否已经超过指定失败数
          if (this.queue[0].trySend <= this.queue[0].maxTrySend) {
            this.queue[0].fn();
          } else {
            console.log(this.queue[0].isCheckMd5Request);
            this.queue[0].cancelSend(this.queue[0].isCheckMd5Request/*取消类型，false文件 || true校验MD5*/);
          }

        }, this.queue[0].delay);
      }
    }
  },
  // 是否发送成功，成功删除上一次队列的请求，否则继续重发
  sendSuccess() {
    this.queue.splice(0, 1);
  },
  // 移除指定字段的所有队列
  removeField(fieldName) {
    this.queue = this.queue.filter(item => {
      return item.fieldName !== fieldName;
    });
    // 继续发送
    this.isSendLoading = false;
    this.send();
  }
};

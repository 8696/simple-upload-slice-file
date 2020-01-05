class Slice {


  constructor(options) {
    // 文件
    this.file = options.file;
    // 文件大小
    this.totalSize = this.file.size;
    // 切片大小
    this.chunkSile = options.chunkSile * 1024 * 1024;
    // 需要传输几次
    this.chunkLength = 0;
    // 切片集合
    this.slices = [];
    // 切片开始位置
    this.start = 0;
    // 切片结束位置
    this.end = 0;
    this._compute();
  }


  /**
   * @description 计算总共需要传输几次
   * @return {Object} this
   * */
  _compute() {
    // console.log('文件总大小' + this.totalSize);
    if (this.totalSize <= this.chunkSile) {
      this.chunkLength = 1;
    } else {
      this.chunkLength = Math.ceil(this.totalSize / this.chunkSile);
    }
    // console.log(this.chunkLength);
  }

  /**
   * @description 获取该文件对象所以切片
   * @return {Array} 切片集合
   * */
  getSlice() {
    if (this.slices.length !== 0) {
      return this.slices;
    }
    for (let i = 1; i <= this.chunkLength; i++) {
      // 如果是总共传输一次或者最后一次
      if (i === this.chunkLength || this.chunkLength === 1) {
        this.end = this.totalSize;
      } else {
        this.end = i * this.chunkSile;
      }
      // 剪切文件
      let blob = this.file.slice(this.start, this.end);
      this.slices.push({
        blob,
        order: i,
        size: blob.size,
        start: this.start,
        end: this.end
      });
      this.start = this.end;
    }
    return this.slices;
  }


  /**
   * @description 获取当前文件对象的大小
   * @return {Number}
   * */
  getSize() {
    return this.totalSize;
  }

  /**
   * @description 获取当前文件切片块数
   * @return {Number}
   * */
  getChunkLength() {
    return this.chunkLength;
  }


}

export default Slice;









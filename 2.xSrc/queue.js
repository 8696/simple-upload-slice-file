/**
 * Created by WebStorm
 * Description: next..
 * User: JinwenLong
 * Author: longjinwen
 * Email: 204084802@qq.com
 * Date: 2020/1/4
 * Time: 3:36 下午
 */




function Queue() {
  var queue = [],
    isIng = false,
    setIng = function (bo) {
      isIng = bo;
    },
    index = 0,
    next = function () {
      setIng(false);
      exec();
      return this;
    },
    again = function () {
      index -= 1;
      next();
      return this;
    },
    exec = function () {
      if (queue.length > index && isIng === false) {
        setIng(true);
        queue[index++](next, again);
      }
    },
    arrayProperties = Object.getOwnPropertyNames(Array.prototype);

  for (var key in arrayProperties) {
    (function (key, _this) {
      key = arrayProperties[key];
      if (['length', 'constructor'].indexOf(key) > -1) {
        return;
      }
      _this[key] = function () {
        return Array.prototype[key].apply(queue, arguments);
      };
    }(key, this));
  }

  this.push2queue = function (handle) {
    queue.push(handle);
    setTimeout(function () {
      exec();
    }, 0);
    return this;
  };

  this.prev = function () {
    index -= 2;
    this.next();
    return this;
  };

  this.next = next;

  this.again = again;

  this.getIndex = function () {
    return index;
  };

  this.getQueue = function () {
    return queue;
  };

  this.empty = function () {
    queue = [];
  };
}

module.exports = Queue;

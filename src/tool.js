


class Tool {
    /**
     * @description 生成随机字符串
     * @return {String}
     * */
    static makeRandom() {
        let keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let maxPos = keys.length;
        let str = '';
        for (let i = 0; i < 20; i++) {
            str += keys.charAt(Math.floor(Math.random() * maxPos));
        }
        return str + new Date().getTime();

    }

    /**
     * @description 获取文件名后缀
     * @return {String} 文件名称
     * @return {String}
     * */
    static getFileNameSuffix(fileName) {
        return fileName.split('.').pop();
    }
    /**
     * @description 将queryString解析成对象
     * @return {String} queryString
     * @return {Object} 转换之后的对象
     * */
    static queryStringToObj(query) {
        let reg = /([^=&\s]+)[=\s]*([^&\s]*)/g;
        let obj = {};
        while (reg.exec(query)) {
            obj[RegExp.$1] = RegExp.$2;
        }
        return obj;
    }

    static deepClone(origin, target) {
        for (let prop in origin) {
            if (origin.hasOwnProperty(prop)) {
                //判断是原始值还是引用值 并且不包含null(null其实是原始值，但是typeof返回是'object')
                if (typeof origin[prop] === 'object' && Object.prototype.toString.call(origin[prop]) !== '[object Null]') {
                    //判断原始值是对象还是数组
                    target[prop] = Object.prototype.toString.call(origin[prop]) === '[object Array]' ? [] : {};
                    Tool.deepClone(origin[prop], target[prop]);
                } else {
                    //string null undefined number
                    target[prop] = origin[prop];
                }
            }
        }
        return target;
    }
}


export default Tool;














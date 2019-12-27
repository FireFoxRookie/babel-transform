/**
 * author: Xiawx
 * createTime: 2019/12/27
 * descript: 读取指定目录下的js文件，利用babel进行转义
 */
const fs = require('fs');
const path = require('path');
const babel = require('babel-core');
class TransformFile {

    /**
     * 构造函数
     * @param {string} rootUrl 开始转义的目录或文件路径
     * @return {!number} null 
     */
    constructor (rootUrl) {
        // 需要babel转义的目录或文件路径
        this.rootUrl = rootUrl;
        // 当前目录下的文件夹集合
        // this.dirArr = [];
        // 当前目录下的js文件集合
        // this.jsFileArr = [];
    }

    /**
     * 初始化目录下文件和js文件
     * @return {!number} null
     */
    initNum () {
        this.dirArr = [];
    }

    /**
     * 给文件或目录设置成绝对路径
     * @param {string} dir 文件或目录的路径前缀 
     * @param {array} files 文件或目录名集合
     * @return {array} 文件或目录的绝对路径集合
     */
    fullPath (dir, files) {
        if (dir && Array.isArray(files)) {
            return files.map((file) => {
                return path.resolve(dir, file);
            })
        }
        throw new Error('path or files is error');
    }

    /**
     * 
     * @param {string} path 目录路径
     * @return {!number} null 
     */
    getDirAndFileNum (path) {
        // 当前目录下js文件数
        const jsFileArr = [];
        // 当前目录下目录数
        const dirArr = [];
        if (path) {
            // 获取给定路径下的子目录文件路径
            let files = fs.readdirSync(path);
            console.log('preFiles', files);
            // 设置每个文件或目录的绝对路径
            files = this.fullPath(path, files);
            console.log('files', files);
            // 循环找出子目录下的所有js文件和目录
            files.forEach(file => {
                const stats = fs.statSync(file);
                if (stats.isFile()) {
                    file.indexOf('.js') > -1 && jsFileArr.push(file);
                }
                if (stats.isDirectory()) {
                    dirArr.push(file);
                }
            })
        }
        return {
            jsFileArr,
            dirArr
        }
    }

    /**
     * 将文件内容进行babel转换并输出
     * @param {string} path js文件地址
     * @return {!number} null 
     */
    babelTransform (path) {
        return new Promise((resolve, reject) => {
            babel.transformFile(path, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    const code = result.code;
                    fs.writeFile(path, code, 'utf8', (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                }
            })
        })
    }

    /**
     * 遍历文件利用babel进行转换
     * @param {string} path 需要遍历的目录地址
     * @return {!number} null
     */
    async setBabel (path) {
        // 获取当前目录下的所有子目录和子js文件
        const {dirArr, jsFileArr} = this.getDirAndFileNum(path);
        if (jsFileArr.length > 0) {
            let index = 0;
            // 循环设置js文件
            while (index < jsFileArr.length) {
                try {
                    // 利用babel转换js文件
                    await this.babelTransform(file);
                    index++;
                } catch (err) {
                    return false;
                }
            }
        }
        if (dirArr.length > 0) {
            dirArr.forEach((path) => {
                this.setBabel(path);
            })
        }
    }

    init () {
        const stats = fs.statSync(this.rootUrl);
        // 判断是否是文件
        if (stats.isFile()) {
            // 判断是否是js文件
            if (this.rootUrl.indexOf('.js') > -1) {
                this.babelTransform(this.rootUrl);
            }
        }
        // 判断是否是目录
        if (stats.isDirectory()) {
            this.setBabel(this.rootUrl);
        }
    }
}
module.exports = TransformFile;

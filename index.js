/**
 * author: Xiawx
 * createTime: 2019/12/27
 * descript: 读取指定目录下的js文件，利用babel进行转义
 */

 const TransBabel = require('./trans-babel.js');
 const args = process.argv.slice(2);
 console.log('rootPath', args[0]);
 const babelInstance = new TransBabel(args[0]);
 babelInstance.init();

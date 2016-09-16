'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fsPromise = require('fs-promise');

var fsp = _interopRequireWildcard(_fsPromise);

var _sequencePromise = require('./sequencePromise');

var _sequencePromise2 = _interopRequireDefault(_sequencePromise);

var _path = require('path');

var path = _interopRequireWildcard(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// utils
// 用来换掉路径中还没 commit 的临时目录名
var replaceTempPath = function replaceTempPath(incomingPath, replaceSet) {
  return incomingPath.split(path.sep).reduce(function (previousValue, currentValue) {
    return (// (previousValue, currentValue, currentIndex, array) =>
      path.join(replaceSet[previousValue] !== undefined ? replaceSet[previousValue] : previousValue, currentValue)
    );
  });
};
// console.log( replaceTempPath('a\\b\\c\\aaa.txt', { 'a\\b': 'a\\~b', 'a\\~b\\c': 'a\\~b\\~c' }) );


// 为了方便大量涉及文件操作的 API 的撰写，我决定将部分会涉及到的文件操作事务化，也就是让非幂等的操作都变成 mkdirT() 这样，T 的意思是 Transaction。
// 这些操作只有当调用 commitFs() 时才会对文件系统产生永久性的影响，而当调用 rollbackFs() 后都会被撤销
// 然而情况涉及到多个操作并发，以及读操作想要读事务性写操作的结果做条件判断，创了又删删了又创中间还往里移动了东西，需要从 req 创建输入流 等等坑，我觉得我只能完成一些常见情况。
// 想想看，我可能需要删掉某个文档：这就先改个名，回滚是改回名，提交是真删掉 ;创建一个文件夹：创就创了呗，回滚是删掉，提交不做啥（如果遵循栈的话就很自然） ;创建文件类似
// 写入文件：就先复制一个成别的名字，回滚是删掉它，提交是覆盖原文件

// 注意两个调用之间得用 then 连接，不然可能会竞争 commitStack
var fs = _extends({
  commitStack: [],
  rollbackStack: [],
  fileNameMap: {}, // 用于保存文件名和临时文件名之间的映射，以后对于所有输入的路径，都看看有没有能用这里面的路径替换掉的

  commit: function commit(callbackWhenDone) {
    return (0, _sequencePromise2.default)(fs.commitStack).then(function (result) {
      fs.rollbackStack = fs.commitStack = [];
      fs.fileNameMap = {};
      return Promise.resolve(typeof callbackWhenDone === 'function' ? callbackWhenDone(result) : result);
    });
  },

  rollback: function rollback(callbackWhenDone) {
    return (0, _sequencePromise2.default)(fs.rollbackStack).then(function (result) {
      fs.rollbackStack = fs.commitStack = [];
      fs.fileNameMap = {};
      return Promise.resolve(typeof callbackWhenDone === 'function' ? callbackWhenDone(result) : result);
    });
  },

  addToCommit: function addToCommit(someFunctionReturnsPromise) {
    return typeof someFunctionReturnsPromise === 'function' ? Promise.resolve(fs.commitStack.unshift(someFunctionReturnsPromise)) : Promise.reject('addToCommit Error: ' + someFunctionReturnsPromise + ' is not a function');
  },

  addToRollback: function addToRollback(someFunctionReturnsPromise) {
    return typeof someFunctionReturnsPromise === 'function' ? Promise.resolve(fs.rollbackStack.unshift(someFunctionReturnsPromise)) : Promise.reject('addToRollback Error: ' + someFunctionReturnsPromise + ' is not a function');
  },

  mkdirT: function mkdirT(dirPath, mode) {
    var replacedDirPath = replaceTempPath(dirPath, fs.fileNameMap);

    return fsp.exists(replacedDirPath).then(function (existsDirPath) {
      if (existsDirPath) {
        return Promise.reject('mkdirT Error: ' + replacedDirPath + ' already exists, may means you use an uuid or something for filename that has already been used');
      }
      var newPath = path.join(path.dirname(replacedDirPath), '~mkdirT~' + path.basename(replacedDirPath)); // 创建一个加 ~ 文件夹子，表示这只是暂时的，可能会被回滚
      fs.fileNameMap[replacedDirPath] = newPath;

      fs.rollbackStack.unshift(function () {
        if (fsp.existsSync(newPath)) {
          return fsp.rmdir(newPath);
        }
      }); // 入栈一个回滚操作：删掉临时文件
      fs.commitStack.unshift(function () {
        if (fsp.existsSync(newPath)) {
          return fsp.rename(newPath, replacedDirPath);
        }
      }); // 入栈一个提交操作：把文件名改成正常版本 // issue:因为有时候会莫名其妙无法找到
      // 说什么 [Error: ENOENT: no such file or directory, rename 'C:\Users\onetwo\Desktop\testDBforPoselevel\poselevel\~mkdirT~USER' -> 'C:\Users\onetwo\Desktop\testDBforPoselevel\poselevel\USER']  errno: -4058,
      // 我至今不知道为啥

      return fsp.mkdir(newPath, mode); // 这是个 Promise
    });
  },

  mkdirRecursiveT: function mkdirRecursiveT(dirpath, dirname) {
    if (typeof dirname === 'undefined') {
      // 判断是否是第一次调用
      if (fsp.existsSync(dirpath)) {
        return Promise.resolve();
      }
      return fs.mkdirRecursiveT(dirpath, path.dirname(dirpath));
    }
    if (dirname !== path.dirname(dirpath)) {
      // 判断第二个参数是否正常，避免调用时传入错误参数
      return fs.mkdirRecursiveT(dirpath);
    }
    if (fsp.existsSync(dirname)) {
      // 递归收尾，创建最深处的文件夹
      return fs.mkdirT(dirpath);
    }
    return fs.mkdirRecursiveT(dirname, path.dirname(dirname)).then(function () {
      return fs.mkdirT(dirpath);
    });
  },

  removeT: function removeT(dirPath) {
    var replacedDirPath = replaceTempPath(dirPath, fs.fileNameMap);

    return fsp.exists(replacedDirPath).then(function (existsDirPath) {
      if (!existsDirPath) {
        return Promise.reject('removeT Error: ' + replacedDirPath + ' dont really exists');
      }
      var newPath = path.join(path.dirname(replacedDirPath), '~removeT~' + path.basename(replacedDirPath)); // 把文件夹变成加 ~ 文件或文件夹子，表示这只是暂时的，可能会被回滚
      fs.fileNameMap[replacedDirPath] = newPath;

      fs.rollbackStack.unshift(function () {
        if (fsp.existsSync(newPath)) {
          return fsp.rename(newPath, replacedDirPath);
        }
      }); // 入栈一个回滚操作：把临时文件或文件夹改回原名
      fs.commitStack.unshift(function () {
        if (fsp.existsSync(newPath)) {
          return fsp.remove(newPath);
        }
      }); // 入栈一个提交操作：把文件或文件夹真的删掉

      return fsp.rename(replacedDirPath, newPath); // 这是个 Promise
    });
  },

  createWriteStreamT: function createWriteStreamT(filePath, options) {
    // https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options 原生不支持链式调用
    var replacedFilePath = replaceTempPath(filePath, fs.fileNameMap);
    var newPath = path.join(path.dirname(replacedFilePath), '~createWriteStreamT~' + path.basename(replacedFilePath)); // 创建一个加 ~ 文件，表示这只是暂时的，可能会被回滚
    fs.fileNameMap[replacedFilePath] = newPath;

    fs.rollbackStack.unshift(function () {
      if (fsp.existsSync(newPath)) {
        return fsp.remove(newPath);
      }
    }); // 入栈一个回滚操作：删掉临时文件
    fs.commitStack.unshift(function () {
      return fsp.existsSync(replacedFilePath) ? fsp.remove(replacedFilePath).then(function () {
        return fsp.rename(newPath, replacedFilePath);
      }) : fsp.rename(newPath, replacedFilePath);
    }); // 入栈一个提交操作：删掉原文件，把文件名改成正常版本

    var _writeStream = fsp.createWriteStream(newPath, options); // 开始创建文件输入流
    return Promise.resolve(_writeStream); // 用起来像 fs.createWriteStreamT('aaa.xml').then(writeStream => {writeStream.write('asdffff'); writeStream.end()}).then(() => fs.commit()).catch(err => console.log(err));
  }

}, fsp);

// fs.mkdirRecursiveT('aaa\\bbb\\ccc')
// .then( () => fs.commit(() => console.log('commit', new Date().getTime())) )
// .catch(err => fs.rollback( () => console.log('rollback', err, new Date().getTime())));

// fs.mkdirT('aaa').then(()=>console.log('mkdirT aaa', new Date().getTime()))
// .then( () => fs.mkdirT('aaa\\bbb').then(()=>console.log('mkdirT aaa\\bbb', new Date().getTime())) )
// .then( () => fs.mkdirT('aaa\\bbb\\ccc').then(()=>console.log('mkdirT aaa\\bbb\\ccc', new Date().getTime())) )
// .then(
//   () => fs.createWriteStreamT('aaa\\bbb\\aaa.xml')
//   .then(writeStream => { writeStream.write('asdffff'); writeStream.end() })
//   .then(()=>console.log('createWriteStreamT ./aaa/bbb/aaa.xml', new Date().getTime()))
// )
// .then( () => fs.commit((aaa) => console.log('commit', new Date().getTime())) )
// .catch(err => fs.rollback( () => console.log('rollback', err, new Date().getTime())));

// fs.createWriteStreamT('aaa.xml').then(writeStream => { writeStream.write('asdffff'); writeStream.end() }).then(() => fs.commit()).catch(err => console.log(err));

exports.default = fs;
/*eslint no-use-before-define: ["error", { "classes": false }]*/
import * as fsp from 'fs-promise';
import { v4 as uuid } from 'node-uuid';
import path from 'path';

import sequencePromise from './sequencePromise';






const fs = {
  fileNameMap: {}, // 用于保存文件名和临时文件名之间的映射，以后对于所有输入的路径，都看看有没有能用这里面的路径替换掉的

  beginTransaction: () => new Transaction(fs),

  ...fsp
};

class Transaction {
  constructor(fsFunctions: Object) {
    this.uuid = uuid();
    this.fs = { ...fsFunctions, beginTransaction: undefined };
  }

  // 创建一个临时文件夹，在里面创建文件夹
  static async mkdir(dirPath, mode) {
    try {
      const dirPathExisted = await fsp.exists(dirPath);
      if (dirPathExisted) {
        return Promise.reject(`mkdirT Error: ${dirPath} already exists, may means you use an uuid or something for filename that has already been used`);
      }
    } catch(error) {

    }

    return .then((existsDirPath) => {
      if (existsDirPath) {
        return Promise.reject(`mkdirT Error: ${replacedDirPath} already exists, may means you use an uuid or something for filename that has already been used`);
      }
      const newPath = path.join(path.dirname(replacedDirPath), `~mkdirT~${path.basename(replacedDirPath)}`);// 创建一个加 ~ 文件夹子，表示这只是暂时的，可能会被回滚
      fs.fileNameMap[replacedDirPath] = newPath;

      fs.rollbackStack.unshift(() => { if (fsp.existsSync(newPath)) { return fsp.rmdir(newPath); } }); // 入栈一个回滚操作：删掉临时文件
      fs.commitStack.unshift(() => { if (fsp.existsSync(newPath)) { return fsp.rename(newPath, replacedDirPath); } }); // 入栈一个提交操作：把文件名改成正常版本 // issue:因为有时候会莫名其妙无法找到
      // 说什么 [Error: ENOENT: no such file or directory, rename 'C:\Users\onetwo\Desktop\testDBforPoselevel\poselevel\~mkdirT~USER' -> 'C:\Users\onetwo\Desktop\testDBforPoselevel\poselevel\USER']  errno: -4058,
      // 我至今不知道为啥

      return fsp.mkdir(newPath, mode); // 这是个 Promise
    });
  }


  static mkdirRecursiveT(dirpath, dirname) {
    if (typeof dirname === 'undefined') { // 判断是否是第一次调用
      if (fsp.existsSync(dirpath)) {
        return Promise.resolve();
      }
      return fs.mkdirRecursiveT(dirpath, path.dirname(dirpath));
    }
    if (dirname !== path.dirname(dirpath)) { // 判断第二个参数是否正常，避免调用时传入错误参数
      return fs.mkdirRecursiveT(dirpath);
    }
    if (fsp.existsSync(dirname)) { // 递归收尾，创建最深处的文件夹
      return fs.mkdirT(dirpath);
    }
    return fs.mkdirRecursiveT(dirname, path.dirname(dirname))
    .then(() => fs.mkdirT(dirpath));
  }


  static removeT(dirPath) {
    const replacedDirPath = replaceTempPath(dirPath, fs.fileNameMap);

    return fsp.exists(replacedDirPath).then((existsDirPath) => {
      if (!existsDirPath) {
        return Promise.reject(`removeT Error: ${replacedDirPath} dont really exists`);
      }
      const newPath = path.join(path.dirname(replacedDirPath), `~removeT~${path.basename(replacedDirPath)}`);// 把文件夹变成加 ~ 文件或文件夹子，表示这只是暂时的，可能会被回滚
      fs.fileNameMap[replacedDirPath] = newPath;

      fs.rollbackStack.unshift(() => { if (fsp.existsSync(newPath)) { return fsp.rename(newPath, replacedDirPath); } }); // 入栈一个回滚操作：把临时文件或文件夹改回原名
      fs.commitStack.unshift(() => { if (fsp.existsSync(newPath)) { return fsp.remove(newPath); } }); // 入栈一个提交操作：把文件或文件夹真的删掉

      return fsp.rename(replacedDirPath, newPath); // 这是个 Promise
    });
  }


  static createWriteStreamT(filePath, options) { // https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options 原生不支持链式调用
    const replacedFilePath = replaceTempPath(filePath, fs.fileNameMap);
    const newPath = path.join(path.dirname(replacedFilePath), `~createWriteStreamT~${path.basename(replacedFilePath)}`);// 创建一个加 ~ 文件，表示这只是暂时的，可能会被回滚
    fs.fileNameMap[replacedFilePath] = newPath;

    fs.rollbackStack.unshift(() => { if (fsp.existsSync(newPath)) { return fsp.remove(newPath); } }); // 入栈一个回滚操作：删掉临时文件
    fs.commitStack.unshift(() => fsp.existsSync(replacedFilePath) ?
           fsp.remove(replacedFilePath).then(() => fsp.rename(newPath, replacedFilePath)) :
           fsp.rename(newPath, replacedFilePath)
    ); // 入栈一个提交操作：删掉原文件，把文件名改成正常版本

    const _writeStream = fsp.createWriteStream(newPath, options); // 开始创建文件输入流
    return Promise.resolve(_writeStream); // 用起来像 fs.createWriteStreamT('aaa.xml').then(writeStream => {writeStream.write('asdffff'); writeStream.end()}).then(() => fs.commit()).catch(err => console.log(err));
  }


}




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

export default fs;

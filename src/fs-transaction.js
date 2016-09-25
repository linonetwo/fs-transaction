/* eslint no-use-before-define: ["error", { "classes": false }]*/
import fsp from 'fs-promise';
import { v4 as uuid } from 'node-uuid';
import path from 'path';
import temp from 'promised-temp';

import sequencePromise from './sequencePromise';

import { MISSING_IMPORTANT_FILE, ALREADY_EXIST } from './errorTypes';


type FsType = {
  beginTransaction: (config: TransactionConfigType) => Transaction; // eslint-disable-line
  mkdirRecursively: (dirPath: string, dirName: string) => Promise<>;
  // ...fsp
}

const fs: FsType = {
  // fileNameMap: {}, // 用于保存文件名和临时文件名之间的映射，以后对于所有输入的路径，都看看有没有能用这里面的路径替换掉的

  beginTransaction: (...config) => new Transaction({ ...config, fsFunctions: fs }),

  async mkdirRecursively(dirPath, dirName) {
    if (typeof dirName === 'undefined') { // 判断是否是第一次调用
      if (await fsp.exists(dirPath)) {
        return Promise.resolve();
      }
      return fs.mkdirRecursively(dirPath, path.dirname(dirPath));
    }
    if (dirName !== path.dirname(dirPath)) { // 判断第二个参数是否正常，避免调用时传入错误参数
      return fs.mkdirRecursively(dirPath);
    }
    if (await fsp.exists(dirName)) { // 递归收尾，创建最深处的文件夹
      return fsp.mkdir(dirPath);
    }
    return fs.mkdirRecursively(dirName, path.dirname(dirName))
      .then(() => fsp.mkdir(dirPath));
  },

  async rmdirRecursively(dirPath) {
    if (await fsp.exists(dirPath)) {
      const fileList = await fsp.readdir(dirPath);
      for (const aFile of fileList) {
        const curPath = dirPath + '/' + aFile;
        if ((await fsp.stat(curPath)).isDirectory()) { // recurse
          await fs.rmdirRecursively(curPath);
        } else { // delete file
          await fsp.unlink(curPath);
        }
      }
      await fsp.rmdir(dirPath);
    }
  },

  ...fsp
};

type TransactionConfigType = {
  basePath: ?string;
  fsFunctions: FsType;
}
class Transaction {
  constructor({ basePath, fsFunctions }: TransactionConfigType) {
    this.uuid = uuid();
    this.fs = { ...fsFunctions, beginTransaction: undefined };

    this.basePath = (basePath && this.fs.existsSync(basePath)) || process.cwd();
    this.tempFolderPath = '';
    this.tempFolderCreated = false;
    this.affixes = {
      prefix: 'tempFolder',
      suffix: '.transaction-fs'
    };
  }

  // 自己也要做判断：如果临时文件夹已存在就不创建了，如果想创建的文件夹已经存在就不创建了
  async exists(newThingPath) {
    if (await this.fs.exists(newThingPath)) {
      throw new Error(ALREADY_EXIST, 'exists()  ', newThingPath);
    }
    if (!this.tempFolderCreated) {
      this.tempFolderPath = await temp.mkdir(this.affixes);
      this.tempFolderCreated = true;
    }
    if (this.tempFolderCreated && !await this.fs.exists(this.tempFolderPath)) {
      throw new Error(MISSING_IMPORTANT_FILE, 'mkdir()  ', this.tempFolderPath);
    }
  }


  // 创建一个临时文件夹，在里面创建想创建的文件夹：
  // 先判断
  // 然后对于 a/b/c ，递归地创建 temp/a/b/c
  async mkdir(dirPath, mode) {
    try {
      await this.exists(dirPath);
      const newPath = path.join(this.basePath, path.dirname(dirPath));
      this.fs.mkdirRecursively(newPath, mode);
    } catch (error) {
      throw error;
    }
  }




  // static removeT(dirPath) {
  //   const replacedDirPath = replaceTempPath(dirPath, fs.fileNameMap);

  //   return fsp.exists(replacedDirPath).then((existsDirPath) => {
  //     if (!existsDirPath) {
  //       return Promise.reject(`removeT Error: ${replacedDirPath} dont really exists`);
  //     }
  //     const newPath = path.join(path.dirname(replacedDirPath), `~removeT~${path.basename(replacedDirPath)}`);// 把文件夹变成加 ~ 文件或文件夹子，表示这只是暂时的，可能会被回滚
  //     fs.fileNameMap[replacedDirPath] = newPath;

  //     fs.rollbackStack.unshift(() => { if (fsp.existsSync(newPath)) { return fsp.rename(newPath, replacedDirPath); } }); // 入栈一个回滚操作：把临时文件或文件夹改回原名
  //     fs.commitStack.unshift(() => { if (fsp.existsSync(newPath)) { return fsp.remove(newPath); } }); // 入栈一个提交操作：把文件或文件夹真的删掉

  //     return fsp.rename(replacedDirPath, newPath); // 这是个 Promise
  //   });
  // }


  // createWriteStreamT(filePath, options) { // https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options 原生不支持链式调用
  //   const replacedFilePath = replaceTempPath(filePath, fs.fileNameMap);
  //   const newPath = path.join(path.dirname(replacedFilePath), `~createWriteStreamT~${path.basename(replacedFilePath)}`);// 创建一个加 ~ 文件，表示这只是暂时的，可能会被回滚
  //   fs.fileNameMap[replacedFilePath] = newPath;

  //   fs.rollbackStack.unshift(() => { if (fsp.existsSync(newPath)) { return fsp.remove(newPath); } }); // 入栈一个回滚操作：删掉临时文件
  //   fs.commitStack.unshift(() => fsp.existsSync(replacedFilePath) ?
  //          fsp.remove(replacedFilePath).then(() => fsp.rename(newPath, replacedFilePath)) :
  //          fsp.rename(newPath, replacedFilePath)
  //   ); // 入栈一个提交操作：删掉原文件，把文件名改成正常版本

  //   const _writeStream = fsp.createWriteStream(newPath, options); // 开始创建文件输入流
  //   return Promise.resolve(_writeStream); // 用起来像 fs.createWriteStreamT('aaa.xml').then(writeStream => {writeStream.write('asdffff'); writeStream.end()}).then(() => fs.commit()).catch(err => console.log(err));
  // }


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

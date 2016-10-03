# fs-transaction

fs with rollback and commit, suitable for letting filesystem in sync with database.
  
## install && import

```shell
npm i -S fs-transaction
```

```javasctipt
import fs from 'fs-transaction';
```

## Current usage

```javascript
// in an async function
const tx = fs.beginTransaction({ basePath: './__test__/testFile' });

await tx.mkdir('aDir');

// fs-transaction is lighter than git, thus offering the document level rollback but not the line level rollback.
// so by default writeFile is in overwrite mode. If you have any question about this, please issue it.
await tx.writeFile('aDir/aFile.md', '# markdown');

await tx.commit();
```

or using promise  

```javascript
// in an es6+ function with bluebird Promise
const tx = fs.beginTransaction({ basePath: './__test__/testFile' });

return Promise.try(() =>
  tx.mkdir('aDir')
)
.then(() =>
  tx.writeFile('aDir/aFile.md', '# markdown')
)
.then(() =>
  tx.commit()
)
```  

## Config

We have following configs:  

- base: base path for all operations, if not provided, ```process.cwd()``` will be used
- mergeResolution (optional): 'overwrite' or 'skip', by default 'overwrite' so that we can use writeFile to update a file

(absolute path and ```../``` is not supported currently, since they may not be the common usage, and supporting them may cause performance problem —— this package is mainly for metadata server programs that can't stand this.)  

```javascript
// in an async function
const tx = fs.beginTransaction({ basePath: './__test__/testFile', mergeResolution: 'overwrite' });
```

## Functions

- mkdirs ( making nested folder, missing ones will be created )
- writeFile ( write or overwrite file )

## If you don't need a transaction

This package wraps the fs-promise, so you can just regard it as an fs-promise instance, when not calling ```beginTransaction()```.  

```javascript

// in an async function
await fs.mkdir('aDir');

await fs.writeFile('aDir/aFile.md', '# markdown');

```

Well, almost the same. The only difference is the missing of ```commit()``` and the disappearance of it's atomic characteristic.  

## If you love decorator

I will experimentally move transaction feature into a decorator. Making it writes just like writing 「fs-promise」, but I'm not sure whether this is necessary.  

```javascript

@transactional({ basePath: './__test__/testFile' })
async function atomicFileSystemOperation() {
  await fs.mkdir('aDir');

  await writeFile('aDir/aFile.md', '# markdown');
}
```

## Building block

This package is mainly built on [fs-promise](https://github.com/kevinbeaty/fs-promise), who includes a full feature fs module, promisifing following functions:  

### fsExtra

- copy
- emptyDir
- ensureFile
- ensureDir
- ensureLink
- ensureSymlink
- mkdirs
- move
- outputFile
- outputJson
- readJson
- remove
- writeJson
- createFile
- createLink
- createSymlink
- emptydir
- mkdirp
- readJSON
- outputJSON
- writeJSON
- walk

### mz/fs

- rename
- ftruncate
- chown
- fchown
- lchown
- chmod
- fchmod
- stat
- lstat
- fstat
- link
- symlink
- readlink
- realpath
- unlink
- rmdir
- mkdir
- readdir
- close
- open
- utimes
- futimes
- fsync
- write
- read
- readFile
- writeFile
- appendFile
- access
- exists
  
merge() function is havely inspired by [merge-dirs](https://github.com/binocarlos/merge-dirs).  

- mergeDir
  
## Who is using this (as an Example)

[ShanghaiTechSemanticServer](https://github.com/Learnone/ShanghaiTechAPPServer) : using it to sync files together with metadata on the database.
  
## How it works

I used to support rollback by [maintaining a commit stack and a rollback stack](https://github.com/linonetwo/fs-transaction/blob/master/doc/originalThinking.md), but it suffers from high frequency async calls: Using it on a server, every query disturb each other.  

As my friend @9173860 suggested, using a temp folder is better:  

- Doing Create/Update, C/U things in the folder with name 「.tx-${uuid}」
- Doing Delete, move things into folder with name 「.tx-${uuid}/.trash」
- Commiting, delete all 「.trash」 folder and merge things in 「.tx-${uuid}」 out, then delete 「.tx-${uuid}」
- Rollbacking, merge things in 「.trash」 folder out, then delete 「.tx-${uuid}」
- Merging, move files under 「.tx-${uuid}」 to current folder, then for each folder, folder exist ? merge this folder : move this folder (need further discussion)
  
Now I'm using [node-temp](https://github.com/bruce/node-temp)'s promisified version [promised-temp](https://github.com/mikaturunen/promised-temp) to create temp file at system specific temp folder.  
  
### Dealing with edge case

Async calls execute in an enigmatic order, so there will be many edge cases. But our only goal is to keep the Eventually Consistent.  
Conflict occurs when we are trying to operate things on the same folder, or on folder and folder's sub folder. [Here](https://github.com/linonetwo/fs-transaction/blob/master/doc/usingTempDir.md) are my analysis. They are also written in the tests.  

## PR is welcome ~

I'm kind of busy recently, analysis are hastily made. Were there any flaw on the analysis, please consider making a PR or clearly issue your analysis :D

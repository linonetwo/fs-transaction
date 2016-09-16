# fs-transaction
fs with rollback and commit, suitable for letting filesystem in sync with database.
  
## install && import
```
npm i -S fs-transaction
```
  
```javasctipt
import fs from 'fs-transaction';
```
## Current usage
```javascript
// in an async function
const tx = fs.beginTransaction();

await tx.mkdir('aDir');

const writeStream = await tx.createWriteStream('aDir/aFile.md');

// fs-transaction is lighter than git, thus offering the document level rollback but not the line level rollback.
// so it is sync inside a writeStream procedure
writeStream.write('# markdown');
writeStream.end();

await tx.commit();
```
or using promise
```javascript
// in an es6+ function with bluebird Promise
const tx = fs.beginTransaction();

return Promise.try(() =>
  tx.mkdirT('aDir')
)
.then(() =>
  tx.createWriteStreamT('aDir/aFile.md')
)
.then(writeStream => {
  writeStream.write('# markdown');
  writeStream.end();
})
.then(() =>
  tx.commit()
)
```

## Decorator usage
I will experimentally move transaction feature into a decorator. Making it writes just like writing 「fs-promise」, but I'm not sure whether this is necessary.
```javascript
@transactional
async function atomicFileSystemOperation() {
  await fs.mkdir('aDir');
  
  const writeStream = await fs.createWriteStream('aDir/aFile.md');

  writeStream.write('# markdown');
  writeStream.end();
}
```
  
## Building block
This package is built on fs-promise, who includes a full feature fs module.  
  
## Who is using this (as an Example)  
[ShanghaiTechSemanticServer](https://github.com/Learnone/ShanghaiTechAPPServer) : using it to sync files together with metadata on the database.
  
## PR is welcome!

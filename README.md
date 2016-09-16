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
  
## How it works
I used support rollback by maintaining a commit stack and a rollback stack, but it suffers from high frequency async calls: Using it on a server, every query disturb each other.   

As my friend @9173860 suggested, using a temp folder is better:  
- Doing Create/Update, C/U things in the folder with name 「.tx-${uuid}」
- Doing Delete, move things into folder with name 「.tx-${uuid}/.trash」
- Commiting, delete all 「.trash」 folder and merge things in 「.tx-${uuid}」 out, then delete 「.tx-${uuid}」
- Rollbacking, merge things in 「.trash」 folder out, then delete 「.tx-${uuid}」
- Merging, move files under 「.tx-${uuid}」 to current folder, then for each folder, folder exist ? merge this folder : move this folder (need further discussion)
  
### Dealing edge case  
Async calls execute in an enigmatic order, so there will be many edge cases. But our only goal is to keep the Eventually Consistent.  
Here are my analysis. They are written in the tests.  
  

- tx1 add file1.md to /a , tx2 delete /a √  
Hoping to have / , since tx1 won't mkdir a, because if a don't exist, there won't be tx2 to delete a    
1: tx1 add -- 2: tx2 delete  
1: /a/.tx-someuuidbytx1/file1.md  
2: /.tx-someuuidbytx2/.trash/a/file1.md  
1commit: rollback due to /a/.tx-someuuidbytx1 no found, rollback fail due to /a/.tx-someuuidbytx1 no found  
2commit: √  
  
1: tx2 delete -- 2: tx1 add  
1: /.tx-someuuidbytx2/.trash/a
2: rollback due to /a no found, rollback fail due to /a no found  
1commit: √  

- tx1 add file1.md to /a , tx2 delete /a  


## PR is welcome!

## Merging  
Merging will use overwrite resolution by default, I think it's OK since most C/U operation will check if thing you want to create already exists.  
If starting a C/U with that thing not existing, but at merge time it just exist... There must be some other operation faster than it create that thing, which is annoying, we are to overwrite it :D  

## EdgeCases

### Making Temporary Dir  
- doing sth. C/U on /a/b, then doing C/U on /a, in one thread
Hoping to make change to both folder, atomicly.
  
0: check ${basePath}/a/b exists  
1: C:\Users\onetwo\AppData\Local\Temp\0d3710e9-2274-4d02-b69b-02738d725b84116822-19252-1j1w6d5.cif36usor.transaction-fs\a\b\foo  
2: check ${basePath}/a exists  
3: C:\Users\onetwo\AppData\Local\Temp\0d3710e9-2274-4d02-b69b-02738d725b84116822-19252-1j1w6d5.cif36usor.transaction-fs\a\bar  
4: 


### Multithread
- tx1 add file1.md to /a , tx2 delete /a √  
Hoping to have / , since tx1 won't mkdir a, because if a don't exist, there won't be tx2 to delete a  
  
case 1: tx1 add -- 2: tx2 delete  
1: /a/.tx-someuuidbytx1/file1.md  
2: /.tx-someuuidbytx2/.trash/a/file1.md  
1commit: rollback due to /a/.tx-someuuidbytx1 no found, rollback fail due to /a/.tx-someuuidbytx1 no found  
2commit: √  
  
case 1: tx2 delete -- 2: tx1 add  
1: /.tx-someuuidbytx2/.trash/a
2: rollback due to /a no found, rollback fail due to /a no found  
1commit: √  
  
*We can learn that if commit or rollback procedure get into a no found error on some file, just simply drop this file.*  

- tx1 mkdir /a and create /a/file1.md, tx2 mkdir /a and mkdir /a/b and create /a/b/file2.md  
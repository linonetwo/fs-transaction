/* eslint-env node, mocha */
/* eslint arrow-body-style: 0 */
import { expect, should } from 'chai';

import { replaceTempPath } from '../src/filenameUtils';

// describe('replaceTempPath.js', () => {
//   it('have a nested filepath, 可以换掉路径中还没 commit 的临时目录名', () => {
//     return expect(
//       replaceTempPath('a\\b\\c\\aaa.txt', { 'a\\b': 'a\\~b', 'a\\~b\\c': 'a\\~b\\~c' })
//     ).to.be.equal(
//       'a\\~b\\~c\\aaa.txt'
//     );
//   });
// });

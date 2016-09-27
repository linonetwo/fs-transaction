/* eslint-env node, mocha */
/* eslint arrow-body-style: 0 */
import Promise from 'bluebird';
import chai from 'chai';
import chaiFs from 'chai-fs';
import isUUID from 'is-uuid';

import path from 'path';
import fs from '../src/fs-transaction';

chai.use(chaiFs);
const { expect, should } = chai;

describe('basic fs characteristic', () => {
  let tx = {};
  const basePath = './__test__/testFile';

  before(() => {
  });

  beforeEach(() => {
    fs.mkdirSync(basePath);
    tx = fs.beginTransaction({ basePath });
  });

  afterEach(async () => {
    await fs.rmdirRecursively(basePath);
  });

  it('new a tx, it have its v4uuid', () => {
    return expect(isUUID.v4(tx.uuid)).to.be.true;
  });

  it('new a tx, it have its fsFunctions, which is without beginTransaction() function', () => {
    return expect(tx.fs).to.be.deep.equal({ ...fs, beginTransaction: undefined });
  });

  it('new a tx, it have its basePath', () => {
    return expect(tx.basePath).to.be.equal(path.join(process.cwd(), basePath));
  });
});

describe('non-transactional helper functions', () => {
  const basePath = './__test__/testFile';

  beforeEach(() => {
    fs.mkdirSync(basePath);
  });

  afterEach(async () => {
    await fs.rmdirRecursively(basePath);
  });

  it('rmdirRecursively , remove a serious of nested folder and file inside', async () => {
    const dirSeries = path.join(basePath + '/a/b/c/');

    // nested folder
    await fs.mkdirRecursively(dirSeries);

    // with file
    const writeStream = await fs.createWriteStream(path.join(dirSeries + 'aFile.md'));
    writeStream.write('# markdown');
    writeStream.end();

    // delete them
    await fs.rmdirRecursively(basePath);

    expect(dirSeries).to.not.be.a.path();
  });

  it('mkdirRecursively , there being a serious of folder with correct name', async () => {
    const dirSeries = path.join(basePath + '/a/b/c/');
    await fs.mkdirRecursively(dirSeries);
    expect(dirSeries).to.be.a.path();
  });
});

describe('frequently used fs-transaction operations', () => {
  let tx = {};
  const basePath = './__test__/testFile';

  before(() => {
  });

  beforeEach(() => {
    fs.mkdirSync(basePath);
    tx = fs.beginTransaction({ basePath });
  });

  afterEach(async () => {
    await fs.rmdirRecursively(basePath);
  });


  it('mkdir then commit, there being a folder with correct name', async () => {
    const dirSeries = path.join(basePath + 'a/b/c/');
    await tx.mkdir('a/b/c/');
    await tx.commit();
    expect(dirSeries).to.be.a.path();
  });
});

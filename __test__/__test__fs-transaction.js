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

  before(() => {
  });

  beforeEach(() => {
    tx = fs.beginTransaction();
  });

  it('new a tx, it have its v4uuid', () => {
    return expect(isUUID.v4(tx.uuid)).to.be.true;
  });

  it('new a tx, it have its fsFunctions, which is without beginTransaction() function', () => {
    return expect(tx.fs).to.be.deep.equal({ ...fs, beginTransaction: undefined });
  });

  it('new a tx, it have its fsFunctions, which is without beginTransaction() function', () => {
    return expect(tx.fs).to.be.deep.equal({ ...fs, beginTransaction: undefined });
  });
});

describe('frequently used fs operations', () => {
  let tx = {};
  const basePath = './__test__/testFile';

  before(() => {
  });

  beforeEach(() => {
    tx = fs.beginTransaction();
  });

  afterEach(async () => {
    await fs.rmdirRecursively(basePath);
  });

  it('rmdirRecursively , remove a serious of nested folder and file inside', async () => {
    const dirSeries = basePath + '/a/b/c/';

    // nested folder
    await fs.mkdirRecursively(dirSeries);

    // with file
    const writeStream = await fs.createWriteStream(dirSeries + 'aFile.md');
    writeStream.write('# markdown');
    writeStream.end();

    // delete them
    await fs.rmdirRecursively(basePath);

    expect(dirSeries).to.not.be.a.path();
  });

  it('mkdirRecursively , there being a serious of folder with correct name', async () => {
    const dirSeries = basePath + '/a/b/c/';
    await fs.mkdirRecursively(dirSeries);
    expect(dirSeries).to.be.a.path();
  });


  it('mkdir then commit, there being a folder with correct name', () => {
  });
});

/* eslint-env node, mocha */
/* eslint arrow-body-style: 0 */
import { expect, should } from 'chai';
import isUUID from 'is-uuid';

import fs from '../src/fs-transaction';


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

  before(() => {
  });

  beforeEach(() => {
    tx = fs.beginTransaction();
  });




  it('mkdir then commit, there being a folder with correct name', () => {
  });
});

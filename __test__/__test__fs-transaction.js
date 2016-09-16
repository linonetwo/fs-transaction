/* eslint-env node, mocha */
import chai from 'chai';

import fs from '../src/fs-transaction';


const { expect, should } = chai;


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

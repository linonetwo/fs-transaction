import { io, AlreadyInUseError, NotSupportedError, helpers } from 'common-errors';

const { FileNotFoundError } = io;
const { generateClass } = helpers;

const MissingImportantFileError = generateClass('MissingImportantFileError', {
  extends: FileNotFoundError,
  args: ['missingFileName'],
  generateMessage: () =>
    `missing-important-file  
    missing ${this.missingFileName}  
    transaction-fs need things like tempfolder and basepath to work, 
    if they prooved to be not exist, fs-transaction won\'t work properly, please check whether it really exist from program side of view  `
});

const AlreadyExistsError = generateClass('AlreadyExistsError', {
  extends: AlreadyInUseError,
  args: ['existedFileName'],
  generateMessage: () =>
  `already-exists  
  ${this.existedFileName} exists  
  this may means you use an uuid or something for filename that has already been used  `
});

export {
  MissingImportantFileError,
  AlreadyExistsError,
  NotSupportedError,
} ;

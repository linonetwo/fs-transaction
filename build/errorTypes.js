'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotSupportedError = exports.AlreadyExistsError = exports.MissingImportantFileError = undefined;

var _commonErrors = require('common-errors');

var FileNotFoundError = _commonErrors.io.FileNotFoundError;
var generateClass = _commonErrors.helpers.generateClass;


var MissingImportantFileError = generateClass('MissingImportantFileError', {
  extends: FileNotFoundError,
  args: ['missingFileName'],
  generateMessage: function generateMessage() {
    return 'missing-important-file  \n    missing ' + undefined.missingFileName + '  \n    transaction-fs need things like tempfolder and basepath to work, \n    if they prooved to be not exist, fs-transaction won\'t work properly, please check whether it really exist from program side of view  ';
  }
});

var AlreadyExistsError = generateClass('AlreadyExistsError', {
  extends: _commonErrors.AlreadyInUseError,
  args: ['existedFileName'],
  generateMessage: function generateMessage() {
    return 'already-exists  \n  ' + undefined.existedFileName + ' exists  \n  this may means you use an uuid or something for filename that has already been used  ';
  }
});

exports.MissingImportantFileError = MissingImportantFileError;
exports.AlreadyExistsError = AlreadyExistsError;
exports.NotSupportedError = _commonErrors.NotSupportedError;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replaceTempPath = replaceTempPath;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function replaceTempPath(incomingPath, replaceSet) {
  return incomingPath.split(_path2.default.sep).reduce(function (previousValue, currentValue) {
    return (// (previousValue, currentValue, currentIndex, array) =>
      _path2.default.join(replaceSet[previousValue] !== undefined ? replaceSet[previousValue] : previousValue, currentValue)
    );
  });
}
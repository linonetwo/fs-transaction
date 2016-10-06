'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint no-use-before-define: ["error", { "classes": false }]*/


var _fsPromise = require('fs-promise');

var _fsPromise2 = _interopRequireDefault(_fsPromise);

var _nodeUuid = require('node-uuid');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _promisedTemp = require('promised-temp');

var _promisedTemp2 = _interopRequireDefault(_promisedTemp);

var _sequencePromise = require('./sequencePromise');

var _sequencePromise2 = _interopRequireDefault(_sequencePromise);

var _errorTypes = require('./errorTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var FsType = function () {
  function FsType(input) {
    return input != null && typeof input.beginTransaction === 'function' && typeof input.mergeDir === 'function';
  }

  ;
  Object.defineProperty(FsType, Symbol.hasInstance, {
    value: function value(input) {
      return FsType(input);
    }
  });
  return FsType;
}();

var fs = _extends({
  // fileNameMap: {}, // 用于保存文件名和临时文件名之间的映射，以后对于所有输入的路径，都看看有没有能用这里面的路径替换掉的

  beginTransaction: function beginTransaction() {
    for (var _len = arguments.length, config = Array(_len), _key = 0; _key < _len; _key++) {
      config[_key] = arguments[_key];
    }

    return new Transaction(Object.assign.apply(Object, [{}].concat(config, [{ fsFunctions: fs }])));
  },

  /* eslint no-continue: 0 */
  mergeDir: function mergeDir(srcPath, destPath) {
    var _this = this;

    var conflictResolver = arguments.length <= 2 || arguments[2] === undefined ? 'overwrite' : arguments[2];
    return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      var files, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, name, srcName, destName, srcStats;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _fsPromise2.default.readdir(srcPath);

            case 2:
              files = _context.sent;

              if (files && (typeof files[Symbol.iterator] === 'function' || Array.isArray(files))) {
                _context.next = 5;
                break;
              }

              throw new TypeError('Expected files to be iterable, got ' + _inspect(files));

            case 5:
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context.prev = 8;
              _iterator = files[Symbol.iterator]();

            case 10:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context.next = 50;
                break;
              }

              name = _step.value;
              srcName = _path2.default.join(srcPath, name);
              destName = _path2.default.join(destPath, name);
              _context.next = 16;
              return _fsPromise2.default.lstat(srcName);

            case 16:
              srcStats = _context.sent;

              if (!srcStats.isDirectory()) {
                _context.next = 26;
                break;
              }

              _context.next = 20;
              return _fsPromise2.default.exists(destName);

            case 20:
              if (_context.sent) {
                _context.next = 23;
                break;
              }

              _context.next = 23;
              return _fsPromise2.default.mkdir(destName);

            case 23:
              _context.next = 25;
              return fs.mergeDir(srcName, destName, conflictResolver);

            case 25:
              return _context.abrupt('continue', 47);

            case 26:
              _context.next = 28;
              return _fsPromise2.default.exists(destName);

            case 28:
              if (_context.sent) {
                _context.next = 33;
                break;
              }

              _context.next = 31;
              return _fsPromise2.default.copy(srcName, destName);

            case 31:
              _context.next = 47;
              break;

            case 33:
              _context.t0 = conflictResolver;
              _context.next = _context.t0 === 'overwrite' ? 36 : _context.t0 === 'skip' ? 46 : 46;
              break;

            case 36:
              _context.next = 38;
              return _fsPromise2.default.mkdir(_path2.default.dirname(srcName));

            case 38:
              _context.t1 = _fsPromise2.default;
              _context.t2 = srcName;
              _context.next = 42;
              return _fsPromise2.default.readFile(destName);

            case 42:
              _context.t3 = _context.sent;
              _context.next = 45;
              return _context.t1.writeFile.call(_context.t1, _context.t2, _context.t3);

            case 45:
              return _context.abrupt('break', 47);

            case 46:
              return _context.abrupt('break', 47);

            case 47:
              _iteratorNormalCompletion = true;
              _context.next = 10;
              break;

            case 50:
              _context.next = 56;
              break;

            case 52:
              _context.prev = 52;
              _context.t4 = _context['catch'](8);
              _didIteratorError = true;
              _iteratorError = _context.t4;

            case 56:
              _context.prev = 56;
              _context.prev = 57;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 59:
              _context.prev = 59;

              if (!_didIteratorError) {
                _context.next = 62;
                break;
              }

              throw _iteratorError;

            case 62:
              return _context.finish(59);

            case 63:
              return _context.finish(56);

            case 64:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this, [[8, 52, 56, 64], [57,, 59, 63]]);
    }))();
  }
}, _fsPromise2.default);

if (!FsType(fs)) {
  throw new TypeError('Value of variable "fs" violates contract.\n\nExpected:\nFsType\n\nGot:\n' + _inspect(fs));
}

function checkNotSupportedPath(aPath) {
  if (_path2.default.isAbsolute(aPath)) {
    throw new _errorTypes.NotSupportedError('wip  ' + aPath + '  absolute path is not supported');
  }
  if (/\.\./.test(_path2.default.normalize(aPath))) {
    throw new _errorTypes.NotSupportedError('wip  ' + aPath + '  path that use .. is not supported');
  }
}

var TransactionConfigType = function () {
  function TransactionConfigType(input) {
    return input != null && (input.basePath == null || typeof input.basePath === 'string') && FsType(input.fsFunctions) && (input.mergeResolution === undefined || input.mergeResolution === 'overwrite' || input.mergeResolution === 'skip');
  }

  ;
  Object.defineProperty(TransactionConfigType, Symbol.hasInstance, {
    value: function value(input) {
      return TransactionConfigType(input);
    }
  });
  return TransactionConfigType;
}();

var Transaction = function () {
  function Transaction(_ref) {
    var _ref$basePath = _ref.basePath;
    var basePath = _ref$basePath === undefined ? process.cwd() : _ref$basePath;
    var fsFunctions = _ref.fsFunctions;
    var _ref$mergeResolution = _ref.mergeResolution;
    var mergeResolution = _ref$mergeResolution === undefined ? 'overwrite' : _ref$mergeResolution;

    _classCallCheck(this, Transaction);

    if (!TransactionConfigType(arguments[0])) {
      throw new TypeError('Value of argument 0 violates contract.\n\nExpected:\nTransactionConfigType\n\nGot:\n' + _inspect(arguments[0]));
    }

    this.uuid = (0, _nodeUuid.v4)();
    this.fs = _extends({}, fsFunctions, { beginTransaction: undefined });

    // 如果传入的是一个绝对路径，就直接在上面干活了
    if (_path2.default.isAbsolute(basePath)) {
      this.basePath = basePath;
      // 如果传入的是正确的相对路径，就接上一个 process.cwd()
    } else if (this.fs.existsSync(_path2.default.join(process.cwd(), basePath))) {
      this.basePath = _path2.default.join(process.cwd(), basePath);
    } else {
      throw new _errorTypes.MissingImportantFileError(_path2.default.join(process.cwd(), basePath));
    }

    this.tempFolderPath = '';
    this.tempFolderCreated = false;
    this.affixes = {
      prefix: 'tempFolder',
      suffix: '.transaction-fs'
    };

    this.mergeResolution = mergeResolution;
  }

  // 自己也要做判断：如果临时文件夹已存在就不创建了，如果想创建的文件夹已经存在就不创建了


  _createClass(Transaction, [{
    key: '_check',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(newThingPath) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (typeof newThingPath === 'string') {
                  _context2.next = 2;
                  break;
                }

                throw new TypeError('Value of argument "newThingPath" violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(newThingPath));

              case 2:
                checkNotSupportedPath(newThingPath);

                _context2.next = 5;
                return this.fs.exists(_path2.default.join(this.basePath, newThingPath));

              case 5:
                if (!_context2.sent) {
                  _context2.next = 7;
                  break;
                }

                throw new _errorTypes.AlreadyExistsError(newThingPath);

              case 7:
                _context2.next = 9;
                return this.fs.exists(this.basePath);

              case 9:
                if (_context2.sent) {
                  _context2.next = 11;
                  break;
                }

                throw new _errorTypes.MissingImportantFileError(this.basePath);

              case 11:
                if (this.tempFolderCreated) {
                  _context2.next = 16;
                  break;
                }

                _context2.next = 14;
                return _promisedTemp2.default.mkdir(this.affixes);

              case 14:
                this.tempFolderPath = _context2.sent;

                this.tempFolderCreated = true;

              case 16:
                _context2.t0 = this.tempFolderCreated;

                if (!_context2.t0) {
                  _context2.next = 21;
                  break;
                }

                _context2.next = 20;
                return this.fs.exists(this.tempFolderPath);

              case 20:
                _context2.t0 = !_context2.sent;

              case 21:
                if (!_context2.t0) {
                  _context2.next = 23;
                  break;
                }

                throw new _errorTypes.MissingImportantFileError(this.tempFolderPath);

              case 23:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _check(_x2) {
        return _ref2.apply(this, arguments);
      }

      return _check;
    }()

    // 创建一个临时文件夹，在里面创建想创建的文件夹：
    // 先判断
    // 然后对于 a/b/c ，递归地创建 temp/a/b/c

  }, {
    key: 'mkdirs',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(dirPath) {
        var newPath;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return this._check(dirPath);

              case 3:
                newPath = _path2.default.join(this.tempFolderPath, dirPath);
                _context3.next = 6;
                return this.fs.mkdirs(newPath);

              case 6:
                _context3.next = 12;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3['catch'](0);
                _context3.next = 12;
                return this.rollback(_context3.t0);

              case 12:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 8]]);
      }));

      function mkdirs(_x3) {
        return _ref3.apply(this, arguments);
      }

      return mkdirs;
    }()
  }, {
    key: 'writeFile',
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(fileName, content) {
        var newPath;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                _context4.next = 3;
                return this._check(fileName);

              case 3:
                newPath = _path2.default.join(this.tempFolderPath, fileName);
                _context4.next = 6;
                return this.fs.writeFile(newPath, content);

              case 6:
                _context4.next = 12;
                break;

              case 8:
                _context4.prev = 8;
                _context4.t0 = _context4['catch'](0);
                _context4.next = 12;
                return this.rollback(_context4.t0);

              case 12:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[0, 8]]);
      }));

      function writeFile(_x4, _x5) {
        return _ref4.apply(this, arguments);
      }

      return writeFile;
    }()

    // 尝试将临时文件夹里的内容合并到工作目录下，一言不合就回滚

  }, {
    key: 'commit',
    value: function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _context5.next = 3;
                return this.fs.mergeDir(this.tempFolderPath, this.basePath, this.mergeResolution);

              case 3:
                _context5.next = 9;
                break;

              case 5:
                _context5.prev = 5;
                _context5.t0 = _context5['catch'](0);
                _context5.next = 9;
                return this.rollback(_context5.t0);

              case 9:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[0, 5]]);
      }));

      function commit() {
        return _ref5.apply(this, arguments);
      }

      return commit;
    }()

    // 直接把临时文件夹删了了事

  }, {
    key: 'rollback',
    value: function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(error) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.fs.remove(this.tempFolderPath);

              case 2:
                if (!error) {
                  _context6.next = 4;
                  break;
                }

                throw error;

              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function rollback(_x6) {
        return _ref6.apply(this, arguments);
      }

      return rollback;
    }()

    // createWriteStreamT(filePath, options) { // https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options 原生不支持链式调用
    //   const replacedFilePath = replaceTempPath(filePath, fs.fileNameMap);
    //   const newPath = path.join(path.dirname(replacedFilePath), `~createWriteStreamT~${path.basename(replacedFilePath)}`);// 创建一个加 ~ 文件，表示这只是暂时的，可能会被回滚
    //   fs.fileNameMap[replacedFilePath] = newPath;

    //   fs.rollbackStack.unshift(() => { if (fsp.existsSync(newPath)) { return fsp.remove(newPath); } }); // 入栈一个回滚操作：删掉临时文件
    //   fs.commitStack.unshift(() => fsp.existsSync(replacedFilePath) ?
    //          fsp.remove(replacedFilePath).then(() => fsp.rename(newPath, replacedFilePath)) :
    //          fsp.rename(newPath, replacedFilePath)
    //   ); // 入栈一个提交操作：删掉原文件，把文件名改成正常版本

    //   const _writeStream = fsp.createWriteStream(newPath, options); // 开始创建文件输入流
    //   return Promise.resolve(_writeStream); // 用起来像 fs.createWriteStreamT('aaa.xml').then(writeStream => {writeStream.write('asdffff'); writeStream.end()}).then(() => fs.commit()).catch(err => console.log(err));
    // }


  }]);

  return Transaction;
}();

exports.default = fs;

function _inspect(input, depth) {
  var maxDepth = 4;
  var maxKeys = 15;

  if (depth === undefined) {
    depth = 0;
  }

  depth += 1;

  if (input === null) {
    return 'null';
  } else if (input === undefined) {
    return 'void';
  } else if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return typeof input === 'undefined' ? 'undefined' : _typeof(input);
  } else if (Array.isArray(input)) {
    if (input.length > 0) {
      var _ret = function () {
        if (depth > maxDepth) return {
            v: '[...]'
          };

        var first = _inspect(input[0], depth);

        if (input.every(function (item) {
          return _inspect(item, depth) === first;
        })) {
          return {
            v: first.trim() + '[]'
          };
        } else {
          return {
            v: '[' + input.slice(0, maxKeys).map(function (item) {
              return _inspect(item, depth);
            }).join(', ') + (input.length >= maxKeys ? ', ...' : '') + ']'
          };
        }
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } else {
      return 'Array';
    }
  } else {
    var keys = Object.keys(input);

    if (!keys.length) {
      if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
        return input.constructor.name;
      } else {
        return 'Object';
      }
    }

    if (depth > maxDepth) return '{...}';
    var indent = '  '.repeat(depth - 1);
    var entries = keys.slice(0, maxKeys).map(function (key) {
      return (/^([A-Z_$][A-Z0-9_$]*)$/i.test(key) ? key : JSON.stringify(key)) + ': ' + _inspect(input[key], depth) + ';';
    }).join('\n  ' + indent);

    if (keys.length >= maxKeys) {
      entries += '\n  ' + indent + '...';
    }

    if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
      return input.constructor.name + ' {\n  ' + indent + entries + '\n' + indent + '}';
    } else {
      return '{\n  ' + indent + entries + '\n' + indent + '}';
    }
  }
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sequencePromise;
// Utils
// 接收函数数组，这些函数都返回 promise，然后我们可以让它们一个个依次执行。mutation 函数可以用于对结果值做一点微小的工作。
// 主要用于数据库通信等一次只能运行一个连接的地方
// http://www.kancloud.cn/kancloud/promises-book/44249
function sequencePromise(tasks) {
  var mutation = arguments.length <= 1 || arguments[1] === undefined ? function (value) {
    return value;
  } : arguments[1];

  var recordValue = function recordValue(results, value) {
    results.push(mutation(value));
    return results;
  };
  var pushValue = recordValue.bind(null, []);
  return tasks.reduce(function (promise, task) {
    return promise.then(task).then(pushValue);
  }, Promise.resolve());
}
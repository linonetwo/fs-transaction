import path from 'path';

export function replaceTempPath(incomingPath, replaceSet) {
  return incomingPath.split(path.sep).reduce(
    (previousValue, currentValue) => // (previousValue, currentValue, currentIndex, array) =>
    path.join(replaceSet[previousValue] !== undefined ? replaceSet[previousValue] : previousValue, currentValue)
  );
}

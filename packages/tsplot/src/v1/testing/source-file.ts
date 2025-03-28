import * as ts from 'typescript';

let testingFileCount = 0;

export function createSourceFile(
  src: string,
  fileName: string = `${testingFileCount}-test.ts`,
  target: ts.ScriptTarget = ts.ScriptTarget.Latest
) {
  const sourceFile = ts.createSourceFile(fileName, src, target);
  testingFileCount += 1;
  return sourceFile;
}

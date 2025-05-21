import * as ts from 'typescript';

export function formatUniqueName(symbol: ts.Symbol, sourceFile?: ts.SourceFile): string {
  const fileName = sourceFile?.fileName ?? symbol.valueDeclaration?.getSourceFile().fileName;
  return `${fileName}#${symbol.escapedName}`;
}

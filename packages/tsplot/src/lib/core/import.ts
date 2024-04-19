import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

export interface Import {
  node: ts.ImportDeclaration;
  identifiers: string[];
  src: string;
}

export function getImportsFromSourceFile(source: ts.SourceFile): Import[] {
  return query(
    source,
    'ImportDeclaration, CallExpression:has(ImportKeyword, Identifier[name="require"])'
  )
    .map((n) => {
      const src = query(n, 'StringLiteral')[0]?.getText();
      const identifiers = query(n, 'ImportClause Identifier').map((i) =>
        i.getText()
      );

      return {
        node: n as ts.ImportDeclaration,
        identifiers,
        src,
      };
    })
    .filter(Boolean) as Import[];
}

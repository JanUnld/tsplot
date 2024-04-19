import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

export function getTypeRefName(node: ts.Node): string | undefined {
  const actualTypeRef = query(node, 'TypeReference, ArrayType')?.[0];

  return (
    actualTypeRef?.getText() ??
    node
      .getText()
      .match(/:([^,:;{)=]+?)[,;{)=]/)?.[1]
      ?.trim()
  );
}

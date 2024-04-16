import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

export interface Decorator {
  node: ts.Decorator;
  name: string;
}

export function resolveDecorators(node: ts.Node): Decorator[] {
  return query(node, 'ClassDeclaration > Decorator').map((n) => ({
    node: n as ts.Decorator,
    name: query(n, 'Identifier')[0].getText(),
  }));
}

import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import {
  appendIdentifierQuery,
  dedupeBy,
  modifyQuery,
  prependDeclQuery,
  removeDeclQuery,
  removeIdentifierQuery,
} from '../utils';

export interface Property {
  selector: string;
  node: ts.Node;
  name: string;
  // isAbstract: boolean;
  // isStatic: boolean;
  // isReadonly: boolean;
  // isOptional: boolean;
  // isPrivate: boolean;
  // isProtected: boolean;
  // isPublic: boolean;
}

export function resolveProps(node: ts.Node): Property[] {
  const selectors: string[] = [
    'PropertySignature',
    'PropertyDeclaration:not(:has(ArrowFunction))',
    'GetAccessor',
    'SetAccessor',
    'EnumMember',
  ];

  return selectors
    .map(prependDeclQuery)
    .map(appendIdentifierQuery)
    .flatMap((selector) =>
      query(node, selector).map((node) => ({ selector, node }))
    )
    .map(({ selector, node }) => {
      return {
        selector: modifyQuery(selector, [
          removeDeclQuery,
          removeIdentifierQuery,
        ]),
        node: node.parent,
        name: node.getText(),
      };
    })
    .filter(dedupeBy((p) => p.name));
}

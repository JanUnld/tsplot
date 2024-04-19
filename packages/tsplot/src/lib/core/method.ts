import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import {
  appendIdentifierToSelector,
  dedupeBy,
  getNodesBySelectors,
  getTypeRefName,
  pipeSelector,
  prependDeclToSelector,
  removeDeclFromSelector,
  removeIdentifierFromSelector,
} from '../utils';

export interface MethodParam {
  node: ts.Node;
  name: string;
  typeName?: string;
}

export interface Method {
  selector: string;
  node: ts.Node;
  name: string;
  typeName?: string;
  params: MethodParam[];
  // returns: string;
  // isAbstract: boolean;
  // isStatic: boolean;
  // isReadonly: boolean;
  // isOptional: boolean;
  // isPrivate: boolean;
  // isProtected: boolean;
  // isPublic: boolean;
}

export function getMethodsFromNode(node: ts.Node): Method[] {
  const selectors: string[] = [
    'MethodSignature',
    'MethodDeclaration',
    'PropertyDeclaration:has(ArrowFunction)',
  ];

  return getNodesBySelectors(
    node,
    selectors.map((selector) =>
      pipeSelector(selector, [
        prependDeclToSelector,
        appendIdentifierToSelector,
      ])
    )
  )
    .map(({ selector, node }) => {
      return {
        selector: pipeSelector(selector, [
          removeDeclFromSelector,
          removeIdentifierFromSelector,
        ]),
        params: query(
          node.parent,
          pipeSelector('Parameter', [
            prependDeclToSelector,
            appendIdentifierToSelector,
          ])
        ).map((node) => ({
          node: node.parent,
          name: node.getText(),
          typeName: getTypeRefName(node.parent),
        })),
        node: node.parent,
        name: node.getText(),
        typeName: getTypeRefName(node.parent),
      };
    })
    .filter(dedupeBy((p) => p.name));
}

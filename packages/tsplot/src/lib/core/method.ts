import * as ts from 'typescript';
import {
  ACCESS_MODIFIER_FLAGS,
  AccessModifiers,
  appendIdentifierToSelector,
  dedupeBy,
  getModifierFlagsFromNode,
  getNodesBySelectors,
  pipeSelector,
  prependDeclToSelector,
  removeDeclFromSelector,
  removeIdentifierFromSelector,
  ResolvedNode,
} from '../utils';
import { getParamsFromNode, Parameter } from './parameter';

export interface Method extends ResolvedNode, AccessModifiers {
  name: string;
  params: Parameter[];
}

export function getMethodsFromNode(node: ts.Node): Method[] {
  const selectors: string[] = [
    'MethodSignature',
    'MethodDeclaration',
    'PropertyDeclaration:has(ArrowFunction)',
  ];

  return getNodesBySelectors(node, selectors, [
    prependDeclToSelector,
    appendIdentifierToSelector,
  ])
    .map(({ selector, node }) => {
      return {
        selector: pipeSelector(selector, [
          removeDeclFromSelector,
          removeIdentifierFromSelector,
        ]),
        node: node.parent,
        name: node.getText(),
        params: getParamsFromNode(node.parent),
        ...getModifierFlagsFromNode(node.parent, ACCESS_MODIFIER_FLAGS),
      };
    })
    .filter(dedupeBy((p) => p.name));
}

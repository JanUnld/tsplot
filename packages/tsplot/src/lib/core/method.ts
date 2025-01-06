import * as ts from 'typescript';
import {
  appendIdentifierToSelector,
  dedupeBy,
  getNodesBySelectors,
  prependDeclToSelector,
} from '../utils';
import { Field } from './field';
import { getSignatureInfoFromNode, SignatureInfo } from './signature-info';
import { getReturnTypeInfoFromNode, ReturnTypeInfo } from './type-info';

export interface Method extends SignatureInfo, Field, ReturnTypeInfo {}

export function getMethodsFromNode(
  node: ts.Node,
  typeChecker: ts.TypeChecker
): Method[] {
  const selectors: string[] = [
    'MethodSignature',
    'MethodDeclaration',
    'Constructor',
    // todo?: 'ArrowFunction',
  ];

  return getNodesBySelectors(node, selectors, [
    prependDeclToSelector,
    appendIdentifierToSelector,
  ])
    .map(({ node }) => {
      return {
        node: node.parent,
        name: node.getText(),
        ...getSignatureInfoFromNode(node, typeChecker),
        ...getReturnTypeInfoFromNode(node.parent, typeChecker),
      };
    })
    .filter(dedupeBy((m) => m.name));
}

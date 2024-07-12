import { Field } from 'tsplot';
import * as ts from 'typescript';
import { getNodesBySelectors } from '../utils';
import { getSignatureInfoFromNode, SignatureInfo } from './signature-info';

export interface Constructor extends SignatureInfo, Field {}

export function getConstructorFromNode(
  node: ts.Node,
  typeChecker: ts.TypeChecker
): Constructor | undefined {
  return getNodesBySelectors(node, ['Constructor']).map(({ node }) => {
    return {
      node: node.parent,
      name: 'constructor',
      ...getSignatureInfoFromNode(node, typeChecker),
    };
  })?.[0];
}

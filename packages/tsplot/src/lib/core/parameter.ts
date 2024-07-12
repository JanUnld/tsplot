import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import {
  getModifierFlagsFromNode,
  PARAMETER_MODIFIER_FLAGS,
  ParameterModifierFlags,
} from '../utils';
import { getTypeInfoFromNode, TypeInfo } from './type-info';

export interface Parameter
  extends Record<ParameterModifierFlags, boolean>,
    TypeInfo {
  node: ts.Node;
  name: string;
}

export function getParamsFromNode(
  node: ts.Node,
  typeChecker: ts.TypeChecker
): Parameter[] {
  if (!ts.isFunctionLike(node) && !ts.isConstructorTypeNode(node)) return [];

  return typeChecker
    .getSignatureFromDeclaration(node)!
    .parameters.map((s) => s.valueDeclaration as ts.Node)
    .map((node) => ({
      node: node,
      name: query(node, 'Identifier')[0].getText(),
      ...getModifierFlagsFromNode(node, PARAMETER_MODIFIER_FLAGS),
      ...getTypeInfoFromNode(node, typeChecker),
    }));
}

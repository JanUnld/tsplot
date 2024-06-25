import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import {
  appendIdentifierToSelector,
  getModifierFlagsFromNode,
  getTypeInfoFromNode,
  PARAMETER_MODIFIER_FLAGS,
  ParameterModifierFlags,
  pipeSelector,
  prependDeclToSelector,
  TypeInfo,
} from '../utils';

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
  return query(
    node,
    pipeSelector('Parameter', [
      prependDeclToSelector,
      appendIdentifierToSelector,
    ])
  ).map((node) => ({
    node: node.parent,
    name: node.getText(),
    ...getModifierFlagsFromNode(node.parent, PARAMETER_MODIFIER_FLAGS),
    ...getTypeInfoFromNode(node.parent, typeChecker),
  }));
}

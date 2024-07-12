import * as ts from 'typescript';
import {
  ACCESS_MODIFIER_FLAGS,
  AccessModifiers,
  getModifierFlagsFromNode,
} from '../utils';
import {
  getParamsFromNode,
  getTypeInfoFromNode,
  Parameter,
  TypeInfo,
} from './index';

export interface SignatureInfo extends TypeInfo, AccessModifiers {
  params: Parameter[];
}

/** @internal */
export function getSignatureInfoFromNode(
  node: ts.Node,
  typeChecker: ts.TypeChecker
): SignatureInfo {
  const n = ts.isIdentifier(node) ? node.parent : node;

  return {
    params: getParamsFromNode(n, typeChecker),
    ...getModifierFlagsFromNode(n, ACCESS_MODIFIER_FLAGS),
    ...getTypeInfoFromNode(n, typeChecker),
  };
}

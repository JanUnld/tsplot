import * as ts from 'typescript';

export type TypeInfoFormatOptions = {
  format?: ts.TypeFormatFlags;
  /**
   * Removes the `| undefined` segment of the formatted string result when `true`.
   * This is especially useful for cases where a type might be `undefined` because
   * its source symbol is marked as optional by `?`
   * @example ```typescript
   * // format would be "string | undefined"
   * typeInfo.typeToString({ removeUndefined: true })
   * // instead returns "string"
   * ```
   */
  removeUndefined?: boolean;
};

export type TypeInfoFormatFn = (options?: TypeInfoFormatOptions) => string;

export interface TypeInfo {
  type: ts.Type;
  typeToString: TypeInfoFormatFn;
}

export interface ReturnTypeInfo {
  returnType: ts.Type;
  returnTypeToString: TypeInfoFormatFn;
}

/** @internal */
export function getTypeInfoFromNode(
  node: ts.Node,
  typeChecker: ts.TypeChecker
): TypeInfo {
  const type = typeChecker.getTypeAtLocation(node);

  return {
    type,
    typeToString: (options) => typeToString(type, node, typeChecker, options),
  };
}

/** @internal */
export function getReturnTypeInfoFromNode(
  node: ts.Node,
  typeChecker: ts.TypeChecker
): ReturnTypeInfo {
  if (!ts.isFunctionLike(node)) {
    throw new Error('Require function-like declaration to get a return type');
  }

  const signature = typeChecker.getSignatureFromDeclaration(node)!;
  const returnType = signature.getReturnType();

  return {
    returnType,
    returnTypeToString: (options) =>
      typeToString(returnType, node, typeChecker, options),
  };
}

export function tryGetReturnTypeFromNode(
  node: ts.Node,
  typeChecker: ts.TypeChecker
): ReturnTypeInfo | undefined {
  try {
    return getReturnTypeInfoFromNode(node, typeChecker);
  } catch (e) {
    return;
  }
}

/** @internal */
function typeToString(
  type: ts.Type,
  node: ts.Node,
  typeChecker: ts.TypeChecker,
  options?: TypeInfoFormatOptions
) {
  let str: string;

  if (ts.isEnumMember(node)) {
    const value = typeChecker.getConstantValue(node);

    switch (typeof value) {
      case 'string':
        str = `"${value}"`;
        break;
      case 'undefined':
        str = '';
        break;
      default:
        str = `${value}`;
        break;
    }
  } else {
    str = typeChecker.typeToString(type, node, options?.format);
  }

  return options?.removeUndefined
    ? str.replace(/\s*\|\s*undefined\s*$/, '')
    : str;
}

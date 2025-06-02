import { inject } from 'injection-js';
import * as ts from 'typescript';
import { TYPE_CHECKER } from '../typescript';

export interface NodeReflection {
  symbol: ts.Symbol;
  type: ts.Type;
}

export class NodeReflector {
  protected readonly typeChecker = inject(TYPE_CHECKER);

  reflectNode(node: ts.Node): Partial<NodeReflection> {
    const identifier = this.getFirstIdentifierFromNode(node);

    const symbol = this.typeChecker.getSymbolAtLocation(identifier ?? node);
    const type = this.typeChecker.getTypeAtLocation(identifier ?? node);

    return { symbol, type };
  }

  reflectNodeOrThrow(node: ts.Node): NodeReflection {
    const identifier = this.getFirstIdentifierFromNodeOrThrow(node);

    const { symbol, type } = this.reflectNode(identifier);

    if (!symbol) throw new MissingSymbolError(node);
    if (!type) throw new MissingTypeError(node);

    return { symbol, type };
  }

  getFirstIdentifierFromNode(node: ts.Node): ts.Identifier | undefined {
    switch (true) {
      case ts.isIdentifier(node):
        return node;

      case ts.isClassLike(node):
      case ts.isInterfaceDeclaration(node):
      case ts.isFunctionDeclaration(node):
      case ts.isTypeAliasDeclaration(node):
      case ts.isTypeParameterDeclaration(node):
      case ts.isEnumDeclaration(node):
        return node.name;

      default:
        return undefined;
    }
  }

  getFirstIdentifierFromNodeOrThrow(node: ts.Node): ts.Identifier {
    const identifier = this.getFirstIdentifierFromNode(node);
    if (!identifier) throw new MissingIdentifierError(node);

    return identifier;
  }

  formatUniqueName(node: ts.Node): string {
    const { symbol } = this.reflectNodeOrThrow(node);
    const fileName = symbol.valueDeclaration?.getSourceFile().fileName;

    return `${fileName}#${symbol.escapedName}`;
  }
}

/** @internal */
function formatNodeError(node: ts.Node): string {
  const fileName = node.getSourceFile().fileName;
  const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(node.pos);

  return `${fileName}#L${line + 1}:${character + 1}`;
}

export class MissingSymbolError extends Error {
  constructor(node: ts.Node) {
    super(`Missing symbol at ${formatNodeError(node)}`);
  }
}

export class MissingTypeError extends Error {
  constructor(node: ts.Node) {
    super(`Missing type at ${formatNodeError(node)}`);
  }
}

export class MissingIdentifierError extends Error {
  constructor(node: ts.Node) {
    super(`Missing identifier at ${formatNodeError(node)}`);
  }
}

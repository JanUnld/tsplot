import * as ts from 'typescript';

export const enum DependencyOrigin {
  Declaration = 'declaration',
  Parameter = 'parameter',
  Decorator = 'decorator',
  Heritage = 'heritage',
}

export interface Dependency {
  origin: DependencyOrigin;
  node: ts.Node;
  name: string;
}

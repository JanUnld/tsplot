import * as ts from 'typescript';
import { matchRegExpOrGlob } from '../utils';
import { Predicate } from './filter-set';

export type SourceFileFilterFn = Predicate<ts.SourceFile>;

export function includeSourceFiles(
  ...pattern: (string | RegExp)[]
): SourceFileFilterFn {
  return (source) =>
    !pattern?.length ||
    pattern.some((p) => matchRegExpOrGlob(p, source.fileName));
}

export function excludeSourceFiles(
  ...pattern: (string | RegExp)[]
): SourceFileFilterFn {
  return (source) =>
    !pattern?.length ||
    !pattern.some((p) => matchRegExpOrGlob(p, source.fileName));
}

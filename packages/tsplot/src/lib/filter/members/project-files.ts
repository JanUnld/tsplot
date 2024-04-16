import { MemberFilterFn } from '../member-filter';
import { excludeSourceFiles, includeSourceFiles } from '../source-files';

export function includeProjectFiles(
  ...pattern: (string | RegExp)[]
): MemberFilterFn {
  return (m) => includeSourceFiles(...pattern)(m.node.getSourceFile());
}

export function excludeProjectFiles(
  ...pattern: (string | RegExp)[]
): MemberFilterFn {
  return (m) => excludeSourceFiles(...pattern)(m.node.getSourceFile());
}

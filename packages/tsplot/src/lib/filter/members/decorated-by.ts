import { matchRegExpOrStr } from '../../utils';
import { MemberFilterFn } from '../member-filter';

export function includeDecoratedBy(
  ...names: (RegExp | string)[]
): MemberFilterFn {
  return (m) =>
    !names?.length ||
    m.decorators?.some((d) => names.some((n) => matchRegExpOrStr(n, d.name)));
}

export function excludeDecoratedBy(
  ...names: (RegExp | string)[]
): MemberFilterFn {
  return (m) => !names?.length || !includeDecoratedBy(...names)(m);
}

export const includeAnnotatedBy = includeDecoratedBy;
export const excludeAnnotatedBy = excludeDecoratedBy;

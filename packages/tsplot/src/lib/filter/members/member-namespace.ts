import { matchRegExpOrStr } from '../../utils';
import { MemberFilterFn } from '../member-filter';

export function includeMemberNamespace(
  ...names: (string | RegExp)[]
): MemberFilterFn {
  return (m) =>
    !names?.length || names.some((name) => matchRegExpOrStr(name, m.name));
}

export function excludeMemberNamespace(
  ...names: (string | RegExp)[]
): MemberFilterFn {
  return (m) => !names?.length || !includeMemberNamespace(...names)(m);
}

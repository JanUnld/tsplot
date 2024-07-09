import { matchRegExpOrGlob } from '../../utils';
import { MemberFilterFn } from '../member-filter';

export function includeMemberName(
  ...names: (string | RegExp)[]
): MemberFilterFn {
  return (m) =>
    !names?.length || names.some((name) => matchRegExpOrGlob(name, m.name));
}

export function excludeMemberName(
  ...names: (string | RegExp)[]
): MemberFilterFn {
  return (m) => !names?.length || !includeMemberName(...names)(m);
}

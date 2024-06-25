import { MemberKind } from '../../core';
import { MemberFilterFn } from '../member-filter';

export function includeMemberKindOf(...kinds: MemberKind[]): MemberFilterFn {
  return (m) => !kinds?.length || kinds.includes(m.kind);
}

export function excludeMemberKindOf(...kinds: MemberKind[]): MemberFilterFn {
  return (m) => !kinds?.length || !includeMemberKindOf(...kinds)(m);
}

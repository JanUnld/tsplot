import { MemberKind } from '../../core';
import { MemberFilterFn } from '../member-filter';

export function includeMemberKindOf(...kinds: MemberKind[]): MemberFilterFn {
  return (m) => !kinds?.length || kinds.includes(m.kind);
}

export function excludeMemberKindOf(...kinds: MemberKind[]): MemberFilterFn {
  return (m) => !kinds?.length || !includeMemberKindOf(...kinds)(m);
}

/** @deprecated Use {@link includeMemberKindOf} instead. Will be removed soon */
export const includeMemberTypeOf = includeMemberKindOf;
/** @deprecated Use {@link excludeMemberKindOf} instead. Will be removed soon */
export const excludeMemberTypeOf = excludeMemberKindOf;

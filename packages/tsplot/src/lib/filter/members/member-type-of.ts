import { MemberType } from '../../core';
import { MemberFilterFn } from '../member-filter';

export function includeMemberTypeOf(...types: MemberType[]): MemberFilterFn {
  return (m) => !types?.length || types.includes(m.type);
}

export function excludeMemberTypeOf(...types: MemberType[]): MemberFilterFn {
  return (m) => !types?.length || !includeMemberTypeOf(...types)(m);
}

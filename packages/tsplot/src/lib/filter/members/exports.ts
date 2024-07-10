import { MemberFilterFn } from 'tsplot';

export function excludeNonExported(): MemberFilterFn {
  return (m) => m.isExported;
}

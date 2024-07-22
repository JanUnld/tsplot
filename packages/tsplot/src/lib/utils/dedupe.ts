import { getMemberUniqueId, ProjectMember } from '../core';

/** @internal */
export function dedupe<T>(it: T, index: number, arr: T[]): boolean {
  return arr.indexOf(it) === index;
}

/** @internal */
export function dedupeBy<T>(selector: (it: T) => any) {
  return (it: T, index: number, arr: T[]) => {
    return arr.findIndex((other) => selector(it) === selector(other)) === index;
  };
}

/** @internal */
export const dedupeByMemberUniqueId = dedupeBy<ProjectMember>((m) =>
  getMemberUniqueId(m)
);

import { Member, ProjectView } from '../core';

const GLOB_STAR = '**';

/** @internal */
function prependPatternWithGlobStar(pattern: string) {
  return !pattern.startsWith(GLOB_STAR)
    ? `${GLOB_STAR}/${pattern.replace(/^\//, '')}`
    : pattern;
}

export type PathsLike = Record<string, string[]>;
export type PathsWithMembers = Record<string, Member[]>;

export function getPathsWithMembersFromProjectView(
  projectView: ProjectView,
  paths: PathsLike
): PathsWithMembers {
  return Object.entries(paths).reduce((acc, [path, pattern]) => {
    pattern = pattern.map(prependPatternWithGlobStar);
    return { ...acc, [path]: projectView.getExportedMembersOfFile(...pattern) };
  }, {} as PathsWithMembers);
}

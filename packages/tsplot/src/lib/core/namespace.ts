import { getMemberUniqueId, Member, ProjectView } from './index';

/** @internal */
const GLOB_STAR = '**';

/** @internal */
function prependPatternWithGlobStar(pattern: string) {
  return !pattern.startsWith(GLOB_STAR)
    ? // we're replacing any potentially existing leading slash with an empty
      // string since it will be prepended together with the GLOB_START anyway
      `${GLOB_STAR}/${pattern.replace(/^\**\//, '')}`
    : pattern;
}

export type PathsLike = Record<string, string[]>;
export type PathsWithMembers = Record<string, Member[]>;

/** @internal */
export function getPathsWithMembersFromProjectView(
  projectView: ProjectView,
  paths: PathsLike
): PathsWithMembers {
  return Object.entries(paths).reduce((acc, [path, pattern]) => {
    pattern = pattern.map(prependPatternWithGlobStar);
    return { ...acc, [path]: projectView.getExportedMembersOfFile(...pattern) };
  }, {} as PathsWithMembers);
}

/** @internal */
export function getOrphanMembersFromProjectView(
  projectView: ProjectView,
  pathsWithMembers: PathsWithMembers
) {
  const membersWithNamespace = Object.values(pathsWithMembers).flat();
  return projectView.members.filter(
    // all members that are not part of any namespace are orphans by definition
    (m) =>
      !membersWithNamespace.find(
        (m2) => getMemberUniqueId(m2) === getMemberUniqueId(m)
      )
  );
}

export interface Namespace {
  path: string;
  members: Member[];
}

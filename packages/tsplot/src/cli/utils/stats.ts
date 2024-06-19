import { getEdges, includeMemberTypeOf, MemberType } from '../../lib';
import { groupSums } from './accumulators';
import { collectHotspots, HotspotOptions } from './hotspots';
import { collectLinesOfCode, LinesOfCodeOptions } from './lines-of-code';
import {
  getProjectMembersAndStartFrom,
  getProjectView,
  setupConsola,
  SharedOptions,
} from './shared-options';

export interface StatsOptions
  extends SharedOptions,
    HotspotOptions,
    LinesOfCodeOptions {}

export interface Stats {
  files: number;
  members: number;
  edges: number;
  classes: number;
  interfaces: number;
  enums: number;
  types: number;
  functions: number;
  variables: number;
  decoratedBy?: Record<string, number>;
  hotspots?: Record<string, number>;
  linesOfCode?: Record<string, number>;
}

export async function collectStats(options: StatsOptions) {
  const restoreConsola = setupConsola(options);

  const projectView = getProjectView(options);
  const members = await getProjectMembersAndStartFrom(projectView, options);
  const edges = getEdges(projectView.members);
  const decoratedBy = members
    .flatMap((m) => m.decorators.map((d) => d.name))
    .reduce(groupSums, {});

  let stats: Stats = {
    files: projectView.files.length,
    members: members.length,
    edges: edges.length,
    classes: members.filter(includeMemberTypeOf(MemberType.Class)).length,
    interfaces: members.filter(includeMemberTypeOf(MemberType.Interface))
      .length,
    enums: members.filter(includeMemberTypeOf(MemberType.Enum)).length,
    types: members.filter(includeMemberTypeOf(MemberType.Type)).length,
    functions: members.filter(includeMemberTypeOf(MemberType.Function)).length,
    variables: members.filter(includeMemberTypeOf(MemberType.Variable)).length,
  };

  if (Object.keys(decoratedBy).length) stats = { ...stats, decoratedBy };

  if (options?.hotspots) {
    const hotspots = await collectHotspots(projectView, options, members);

    if (Object.keys(hotspots).length) stats = { ...stats, hotspots };
  }

  if (options?.linesOfCode) {
    const linesOfCode = await collectLinesOfCode(projectView.files, options);

    stats = { ...stats, linesOfCode };
  }

  restoreConsola();
  return stats;
}

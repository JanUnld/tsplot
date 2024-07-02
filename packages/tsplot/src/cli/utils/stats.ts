import { getEdges, includeMemberKindOf, MemberKind } from '../../lib';
import { groupSums } from './accumulators';
import { collectHotspots, HotspotOptions } from './hotspots';
import { collectLinesOfCode, LinesOfCodeOptions } from './lines-of-code';
import {
  getConfinedProjectViewFromMemberOrDefault,
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

  const confinedView = await getConfinedProjectViewFromMemberOrDefault(
    getProjectView(options),
    options
  );
  const members = confinedView.members;
  const edges = getEdges(confinedView.members);
  const decoratedBy = members
    .flatMap((m) => m.decorators.map((d) => d.name))
    .reduce(groupSums, {});

  let stats: Stats = {
    files: confinedView.files.length,
    members: members.length,
    edges: edges.length,
    classes: members.filter(includeMemberKindOf(MemberKind.Class)).length,
    interfaces: members.filter(includeMemberKindOf(MemberKind.Interface))
      .length,
    enums: members.filter(includeMemberKindOf(MemberKind.Enum)).length,
    types: members.filter(includeMemberKindOf(MemberKind.Type)).length,
    functions: members.filter(includeMemberKindOf(MemberKind.Function)).length,
    variables: members.filter(includeMemberKindOf(MemberKind.Variable)).length,
  };

  if (Object.keys(decoratedBy).length) stats = { ...stats, decoratedBy };

  if (options?.hotspots) {
    const hotspots = await collectHotspots(confinedView, options, members);

    if (Object.keys(hotspots).length) stats = { ...stats, hotspots };
  }

  if (options?.linesOfCode) {
    const linesOfCode = await collectLinesOfCode(confinedView.files, options);

    stats = { ...stats, linesOfCode };
  }

  restoreConsola();
  return stats;
}

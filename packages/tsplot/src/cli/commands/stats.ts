import { program } from 'commander';
import { getEdges, includeMemberTypeOf, MemberType } from '../../lib';
import {
  collectHotspots,
  collectLinesOfCode,
  getProjectMembersAndStartFrom,
  getProjectView,
  groupSums,
  HotspotOptions,
  LinesOfCodeOptions,
  logSharedOptions,
  output,
  setupLogLevel,
  setupSharedOptions,
  SharedOptions,
} from '../utils';

export interface StatsOptions
  extends SharedOptions,
    HotspotOptions,
    LinesOfCodeOptions {}

export function setupStatsCommand() {
  setupSharedOptions(
    program
      .command('stats')
      .description('generate statistics for a typescript project')
      .option('--hotspots', 'include hotspots in the statistics', false)
      .option(
        '--hotspotThreshold <number>',
        'dependency/dependents threshold for hotspot detection',
        (value) => parseInt(value, 10),
        5
      )
      .option(
        '--hotspotMax <number>',
        'maximum number of hotspots to be included',
        (value) => parseInt(value, 10),
        10
      )
      .option(
        '--linesOfCode',
        'include lines of code per file in the statistics',
        false
      )
      .option(
        '--minLinesOfCode',
        'minimum number of lines of code to be included',
        (value) => parseInt(value, 10),
        500
      )
  ).action(stats);
}

export async function stats(options: StatsOptions) {
  setupLogLevel(options);
  logSharedOptions(options);

  const graph = getProjectView(options);
  const members = await getProjectMembersAndStartFrom(graph, options);
  const edges = getEdges(graph.members);
  const decoratedBy = members
    .flatMap((m) => m.decorators.map((d) => d.name))
    .reduce(groupSums, {});

  let stats: Record<string, unknown> = {
    files: graph.files.length,
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
    const hotspots = await collectHotspots(graph, options, members);

    if (Object.keys(hotspots).length) stats = { ...stats, hotspots };
  }

  if (options?.linesOfCode) {
    const linesOfCode = await collectLinesOfCode(graph.files, options);

    stats = { ...stats, linesOfCode };
  }

  const str = JSON.stringify(stats, null, 2);

  await output(str, options);
}

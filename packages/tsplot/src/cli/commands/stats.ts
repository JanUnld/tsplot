import { Command } from 'commander';
import {
  logSharedOptions,
  output,
  setupConsola,
  setupSharedOptions,
} from '../utils';
import { collectStats, StatsOptions } from '../utils/stats';

/** @internal */
export function setupStatsCommand(program: Command) {
  return setupSharedOptions(
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
        '--minLinesOfCode <number>',
        'minimum number of lines of code to be included',
        (value) => parseInt(value, 10),
        500
      )
  ).action(stats);
}

export async function stats(options: StatsOptions) {
  setupConsola(options);
  logSharedOptions(options);

  const stats = await collectStats(options);
  const str = JSON.stringify(stats, null, 2);

  await output(str, options);
}

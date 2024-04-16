import { Member, ProjectView } from '../../lib';
import { entriesToObject, groupSums } from './accumulators';
import { SharedOptions } from './shared-options';

export type Hotspots = Record<string, number>;

export interface HotspotOptions extends SharedOptions {
  hotspots?: boolean;
  hotspotThreshold?: number;
  hotspotMax?: number;
}

export async function collectHotspots(
  projectView: ProjectView,
  options?: HotspotOptions,
  members: Member[] = projectView.members
): Promise<Hotspots> {
  // intermediate result, not intended for further usage besides hotspot identification
  const memberDepsExpansion = await Promise.all(
    members.map((m) =>
      options?.reverse
        ? projectView.resolveDependentMembers(m, { depth: 0 })
        : projectView.resolveDependencyMembers(m, { depth: 0 })
    )
  );
  const memberDepSums = memberDepsExpansion
    .flat()
    .map((m) => m.name)
    .reduce(groupSums, {});

  return Array.from(Object.entries(memberDepSums))
    .sort(([, sumA], [, sumB]) => sumB - sumA)
    .filter(([, sum]) => sum > (options?.hotspotThreshold ?? -1))
    .slice(0, options?.hotspotMax)
    .reduce(entriesToObject, {});
}

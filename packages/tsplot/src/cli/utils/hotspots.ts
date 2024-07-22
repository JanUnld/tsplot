import { ProjectMember, ProjectView } from '../../lib';
import { entriesToObject, groupSums } from './accumulators';
import { SharedOptions } from './shared-options';

/** @internal */
export type Hotspots = Record<string, number>;

/** @internal */
export interface HotspotOptions extends SharedOptions {
  hotspots?: boolean;
  hotspotThreshold?: number;
  hotspotMax?: number;
}

/** @internal */
export async function collectHotspots(
  projectView: ProjectView,
  options?: HotspotOptions,
  members: ProjectMember[] = projectView.members
): Promise<Hotspots> {
  // intermediate result, not intended for further usage besides hotspot identification
  const memberDepsExpansion = await Promise.all(
    members.map((m) =>
      options?.reverse
        ? projectView.getDependentMembers(m, { depth: 0 })
        : projectView.getDependencyMembers(m, { depth: 0 })
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

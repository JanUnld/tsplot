import { ReflectiveInjector } from 'injection-js';
import { getProgramFromProjectViewOptions, ProjectViewOptions } from '../../lib';
import { InMemoryCache, provideProjectMemberCache } from './cache';
import {
  InterfaceDiscoveryStrategy,
  ProjectMemberDiscovery,
  provideProjectMemberDiscoveryStrategies,
} from './discovery';
import { provideProgram, provideSourceFileResolver, provideTypeChecker } from './typescript';

export type ProjectAnalysisOptions = ProjectViewOptions;

// Desired use-cases for `createProjectAnalysis`:
// - Project analysis with an existing `ts.Program`
// - Project analysis with an existing `ProjectAnalysis`
// - Project analysis with a `tsconfig` json file path
// - Project analysis with a `ts.ParsedCommandLine` object (parsed `tsconfig`)

export function createProjectAnalysis(options: ProjectAnalysisOptions) {
  const program = getProgramFromProjectViewOptions(options);

  const injector = ReflectiveInjector.resolveAndCreate([
    provideProgram(program),
    provideTypeChecker(),
    provideSourceFileResolver(),

    provideProjectMemberCache(InMemoryCache),
    provideProjectMemberDiscoveryStrategies([InterfaceDiscoveryStrategy]),

    ProjectMemberDiscovery,
  ]);

  // 1. Discover project sources (files)
  // 2. Discover project members
  // 3. Discover dependencies
  // 4. Discover codeflow (future feature)

  return {
    discover(): ProjectMemberDiscovery {
      return injector.get(ProjectMemberDiscovery);
    },
  };
}

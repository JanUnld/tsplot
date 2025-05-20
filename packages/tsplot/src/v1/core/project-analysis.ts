import { ReflectiveInjector } from 'injection-js';
import { getProgramFromProjectViewOptions, ProjectViewOptions } from '../../lib';
import { InterfaceDiscoveryStrategy, provideMemberDiscoveryStrategies } from './discovery';
import { ProjectDiscovery } from './phases';
import { provideProgram, provideTypeChecker } from './typescript';

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

    provideMemberDiscoveryStrategies([InterfaceDiscoveryStrategy]),

    ProjectDiscovery,
  ]);

  // 1. Discover project sources (files)
  // 2. Discover project members
  // 3. Discover dependencies
  // 4. Discover codeflow (future feature)

  return {
    discover(): ProjectDiscovery {
      return injector.get(ProjectDiscovery);
    },
  };
}

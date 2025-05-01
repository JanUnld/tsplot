import { ReflectiveInjector } from 'injection-js';
import { getProgramFromProjectViewOptions, ProjectViewOptions } from '../../lib';
import { InterfaceDiscovery, ProjectMemberDiscovery, provideMemberDiscoveries } from './discovery';
import { provideProgram, provideTypeChecker } from './typescript';

export type ProjectAnalysisOptions = ProjectViewOptions;

export function createAnalysis(options: ProjectAnalysisOptions) {
  const program = getProgramFromProjectViewOptions(options);

  const injector = ReflectiveInjector.resolveAndCreate([
    provideProgram(program),
    provideTypeChecker(),

    provideMemberDiscoveries([InterfaceDiscovery]),
  ]);

  // 1. Discover project files
  const sourceFiles = program.getSourceFiles();
  // 2. Discover project members
  const discover = () => {
    const discoveries: ProjectMemberDiscovery[] = injector.get(ProjectMemberDiscovery);
    // Parallelize the discovery over all source files and discoveries asynchronously
    const promises = sourceFiles.flatMap((sourceFile) => {
      return discoveries.flatMap(async (discovery) => discovery.fromSourceFile(sourceFile));
    });
    return Promise.all(promises).then((r) => r.flat());
  };

  // 3. Discover dependencies
  // 4. Discover codeflow (future feature)

  return {};
}

import { Container } from 'inversify';
import { getProgramFromProjectViewOptions, ProjectViewOptions } from '../../lib';
import { PROGRAM, TYPE_CHECKER } from './di';
import { ProjectMember, ProjectMemberDiscovery } from './discovery';

export interface ProjectAnalysis {
  discover(): Promise<ProjectMember[]>;
}

export type ProjectAnalysisOptions = ProjectViewOptions;

export function createAnalysis(options: ProjectAnalysisOptions): ProjectAnalysis {
  const di = new Container({ autobind: true, defaultScope: 'Singleton' });
  const program = getProgramFromProjectViewOptions(options);

  di.bind(PROGRAM).toConstantValue(program);
  di.bind(TYPE_CHECKER).toDynamicValue((context) =>
    context.get<typeof program>(PROGRAM).getTypeChecker()
  );

  // 1. Discover project files
  const sourceFiles = program.getSourceFiles();
  // 2. Discover project members
  const discover = () => {
    // Parallelize the discovery over all source files and discoveries asynchronously
    const discoveries = di.getAll(ProjectMemberDiscovery);
    const promises = sourceFiles.flatMap((sourceFile) => {
      return discoveries.flatMap(async (discovery) => discovery.fromSourceFile(sourceFile));
    });
    return Promise.all(promises).then((r) => r.flat());
  };

  // 3. Discover dependencies
  // 4. Discover codeflow (future feature)

  return {};
}

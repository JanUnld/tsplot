import { inject, Injector } from 'injection-js';
import { Predicate } from 'tsplot';
import * as ts from 'typescript';
import { runInInjectionContext } from '../../utils';
import { ProjectMemberDiscoveryStrategy } from '../discovery';
import { PROGRAM } from '../typescript';

export async function discoverProjectMembers(sourceFiles: ts.SourceFile[]) {
  // @ts-ignore: Remove ignore after https://github.com/mgechev/injection-js/issues/68 resolved
  const strats = inject<ProjectMemberDiscoveryStrategy[]>(ProjectMemberDiscoveryStrategy);

  // Discover project members in parallel for each source file and discovery
  const promises = sourceFiles.flatMap((sourceFile) => {
    return strats.flatMap(async (strat) =>
      strat.getReflectedProjectMemberFromSourceFile(sourceFile)
    );
  });

  // Wait for all promises to resolve and flatten the result
  return Promise.all(promises).then((reflectedMembers) => reflectedMembers.flat());
}

export class ProjectDiscovery {
  protected readonly program = inject(PROGRAM);
  // @ts-ignore: Remove ignore after https://github.com/mgechev/injection-js/issues/68 resolves
  protected readonly injector = inject(Injector);

  async getProjectMembers(options?: { filter?: Predicate<ts.SourceFile> }) {
    const { filter } = options ?? {};
    const sourceFiles = this.program.getSourceFiles().filter((sourceFile) => {
      // todo: consider identifying external files, that are not part of the project (e.g. node_modules)
      return !sourceFile.isDeclarationFile && (!filter || filter(sourceFile));
    });

    return runInInjectionContext(this.injector, () => discoverProjectMembers(sourceFiles));
  }

  async getProjectMembersFromSourceFile(sourceFileOrName: ts.SourceFile | string) {
    const sourceFile = this._coerceSourceFile(sourceFileOrName);

    // early out if no source file is given
    if (sourceFile == null) return [];
    else {
      return runInInjectionContext(this.injector, () => discoverProjectMembers([sourceFile]));
    }
  }

  // todo: async getProjectMemberDependencies();
  // todo: async getProjectMembersWithDependencies();
  // todo: async getProjectCodeflow();

  /**
   * Returns a {@link SourceFile} based on the provided filepath or file name.
   *
   * @param fileName Partial or full filepath of the source file
   */
  getSourceFile(fileName: string) {
    // todo: consider glob matching support for fileName?
    //  Does it even provide any benefits?
    return this.program
      .getSourceFiles()
      .find((sourceFile) => sourceFile.fileName.endsWith(fileName));
  }

  private _coerceSourceFile(sourceFileOrName: ts.SourceFile | string) {
    return typeof sourceFileOrName === 'string'
      ? this.getSourceFile(sourceFileOrName)
      : sourceFileOrName;
  }
}

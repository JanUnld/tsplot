import { inject } from 'injection-js';
import * as ts from 'typescript';
import { Predicate } from '../../../lib';
import { PROJECT_MEMBER_CACHE, setCacheEntries } from '../cache';
import { PROGRAM, SOURCE_FILE_RESOLVER } from '../typescript';
import { ProjectMemberDiscoveryStrategy } from './member';

export class ProjectMemberDiscovery {
  protected readonly program = inject(PROGRAM);
  protected readonly getSourceFile = inject(SOURCE_FILE_RESOLVER);
  protected readonly cache = inject(PROJECT_MEMBER_CACHE);

  protected readonly strategies = inject<ProjectMemberDiscoveryStrategy[]>(
    // @ts-ignore: todo: remove ignore after https://github.com/mgechev/injection-js/issues/68 resolves
    ProjectMemberDiscoveryStrategy
  );

  async getProjectMembers(options?: { filter?: Predicate<ts.SourceFile> }) {
    const { filter } = options ?? {};
    const sourceFiles = this.program.getSourceFiles().filter((sourceFile) => {
      // todo: consider identifying external files, that are not part of the project (e.g. node_modules)
      return !sourceFile.isDeclarationFile && (!filter || filter(sourceFile));
    });

    return sourceFiles.flatMap(this.getProjectMembersFromSourceFile);
  }

  async getProjectMembersFromSourceFile(sourceFileOrName: ts.SourceFile | string) {
    const sourceFile = this.getSourceFile(sourceFileOrName);
    const isMissingSourceFile = sourceFile == null;
    // early out if no source file is given
    return isMissingSourceFile ? [] : this._getAndCacheProjectMembers([sourceFile]);
  }

  private async _getAndCacheProjectMembers(sourceFiles: ts.SourceFile[]) {
    // Discover project members in parallel for each source file and discovery
    const promises = sourceFiles.flatMap((sourceFile) => {
      return this.strategies.flatMap(async (strat) =>
        strat.getReflectedProjectMembersFromSourceFile(sourceFile)
      );
    });
    // Wait for all promises to resolve and flatten the result
    const members = await Promise.all(promises).then((reflectedMembers) => reflectedMembers.flat());

    setCacheEntries(
      this.cache,
      members.map((member) => [member.uniqueName, member])
    );

    return members;
  }
}

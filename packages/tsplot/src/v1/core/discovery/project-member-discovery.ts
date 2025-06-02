import { inject } from 'injection-js';
import * as ts from 'typescript';
import { Predicate } from '../../../lib';
import { PROJECT_MEMBER_CACHE, setCacheEntries } from '../cache';
import { PROGRAM, SOURCE_FILE_RESOLVER } from '../typescript';
import { ProjectMemberDiscoveryStrategy, ReflectedProjectMember } from './member';

export class ProjectMemberDiscovery {
  protected readonly program = inject(PROGRAM);
  protected readonly getSourceFile = inject(SOURCE_FILE_RESOLVER);
  protected readonly cache = inject(PROJECT_MEMBER_CACHE);

  protected readonly strategies = inject<ProjectMemberDiscoveryStrategy[]>(
    // @ts-ignore: todo: remove ignore after https://github.com/mgechev/injection-js/issues/68 resolves
    ProjectMemberDiscoveryStrategy
  );

  getProjectMembers(options?: { filter?: Predicate<ts.SourceFile> }): ReflectedProjectMember[] {
    const { filter } = options ?? {};
    const sourceFiles = this.program.getSourceFiles().filter((sourceFile) => {
      // todo: consider identifying external files, that are not part of the project (e.g. node_modules)
      return !sourceFile.isDeclarationFile && (!filter || filter(sourceFile));
    });

    return this._getAndCacheProjectMembers(sourceFiles);
  }

  getProjectMembersFromSourceFile(
    sourceFileOrName: ts.SourceFile | string
  ): ReflectedProjectMember[] {
    const sourceFile = this.getSourceFile(sourceFileOrName);
    const isMissingSourceFile = sourceFile == null;
    // early out if no source file is given
    return isMissingSourceFile ? [] : this._getAndCacheProjectMembers([sourceFile]);
  }

  private _getAndCacheProjectMembers(sourceFiles: ts.SourceFile[]) {
    // Discover project members in parallel for each source file and discovery
    const members = sourceFiles.flatMap((sourceFile) => {
      return this.strategies.flatMap((strat) =>
        strat.getReflectedProjectMembersFromSourceFile(sourceFile)
      );
    });

    setCacheEntries(
      this.cache,
      members.map((member) => [member.uniqueName, member])
    );

    return members;
  }
}

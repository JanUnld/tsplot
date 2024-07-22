import * as ts from 'typescript';
import { getImportsFromSourceFile, Import } from './import';
import { getMembersFromSourceFile, ProjectMember } from './project-member';

export interface ProjectFile {
  source: ts.SourceFile;
  imports: Import[];
  members: ProjectMember[];
}

/** @internal */
export function getProjectFileFromSourceFile(
  source: ts.SourceFile,
  typeChecker: ts.TypeChecker
): ProjectFile {
  const members = getMembersFromSourceFile(source, typeChecker);
  const imports = getImportsFromSourceFile(source);
  return { source, members, imports };
}

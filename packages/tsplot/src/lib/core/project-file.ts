import * as ts from 'typescript';
import { Import, resolveImports } from './import';
import { Member, resolveMembers } from './member';

export interface ProjectFile {
  source: ts.SourceFile;
  imports: Import[];
  members: Member[];
}

/** @internal */
export function toProjectFile(source: ts.SourceFile): ProjectFile {
  const members = resolveMembers(source);
  const imports = resolveImports(source);
  return { source, members, imports };
}

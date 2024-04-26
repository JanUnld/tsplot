import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import { FilterSet, SourceFileFilterFn } from '../filter';
import { dedupeBy } from '../utils';
import { Dependency, DependencyOrigin } from './dependency';
import { Member, MemberType } from './member';
import { getProjectFileFromSourceFile, ProjectFile } from './project-file';

function coerceMemberName(memberOrName: Member | string) {
  return typeof memberOrName === 'string' ? memberOrName : memberOrName.name;
}

export class ProjectView {
  private _files: ProjectFile[];
  private _members: Member[];

  readonly filters = new FilterSet<Member>();

  get files(): ProjectFile[] {
    return this._files;
  }
  get members(): Member[] {
    return this.filters.apply(this._members);
  }

  constructor(
    readonly sources: ts.SourceFile[],
    filters?: SourceFileFilterFn[]
  ) {
    this._files = this._getProjectFiles(filters);
    this._members = this.files.flatMap((f) => f.members);
  }

  async getDependencyMembers(member: Member, options?: { depth?: number }) {
    let depth = options?.depth;

    let deps = member.deps
      .map((d) => this.getMemberByName(d.name))
      .filter(Boolean) as Member[];

    if (depth === 0)
      return deps.concat(member).filter(this.hasMember.bind(this));
    if (depth != null) depth--;

    for (const m of deps) {
      let members = (await this.getDependencyMembers(m, { depth })).filter(
        (m2) => ![m.name, m2.name].includes(member.name)
      );

      deps = [...members, ...deps].filter(dedupeBy((m) => m.name));
    }

    return deps.concat(member).filter(this.hasMember.bind(this));
  }

  async getDependentMembers(member: Member, options?: { depth?: number }) {
    let depth = options?.depth;

    let dependents = this.members
      .filter((m) => m.deps.some((d) => d.name === member.name))
      .filter(Boolean) as Member[];

    if (depth === 0)
      return dependents.concat(member).filter(this.hasMember.bind(this));
    if (depth != null) depth--;

    for (const m of dependents) {
      let members = (await this.getDependentMembers(m, { depth })).filter(
        (m2) => ![m.name, m2.name].includes(member.name)
      );

      dependents = [...members, ...dependents].filter(dedupeBy((m) => m.name));
    }

    return dependents.concat(member).filter(this.hasMember.bind(this));
  }

  getMembersOfType(type: MemberType) {
    return this.members.filter((m) => m.type === type);
  }

  getMemberByName(name: string) {
    return this.members.find((m) => m.name === name);
  }

  getFileOfMember(member: Member) {
    return this.files.find((f) => f.members.includes(member));
  }

  hasMember(memberOrName: Member | string) {
    const memberName = coerceMemberName(memberOrName);
    return this.members.some((m) => m.name === memberName);
  }

  private _getProjectFiles(filters?: SourceFileFilterFn[]): ProjectFile[] {
    const files = FilterSet.with(filters ?? [])
      .apply(this.sources)
      .map(getProjectFileFromSourceFile);

    this._files = files;
    this._members = files.flatMap((f) => f.members);

    return files.map((file) => ({
      ...file,
      members: file.members.map((member) => ({
        ...member,
        deps: this._getDirectDeps(member),
      })),
    }));
  }

  private _getDirectDeps(member: Member): Dependency[] {
    const toDep = (origin: DependencyOrigin, node: ts.Node) =>
      <Dependency>{
        origin,
        node,
        name: query(node, 'Identifier')[0].getText(),
      };

    const decoratorQuery = 'ClassDeclaration > Decorator Identifier';
    const decoratorDeps = query(member.node, decoratorQuery).map((n) =>
      toDep(DependencyOrigin.Decorator, n)
    );

    const heritageQuery = 'HeritageClause Identifier';
    const heritageDeps = query(member.node, heritageQuery).map((n) =>
      toDep(DependencyOrigin.Heritage, n)
    );

    const paramQuery =
      'Constructor Parameter TypeReference, FunctionDeclaration Parameter TypeReference';
    const paramDeps = query(member.node, paramQuery).map((n) =>
      toDep(DependencyOrigin.Parameter, n)
    );

    const otherQueries = [
      'VariableStatement:not(SourceFile > VariableStatement) Identifier:first-child',
      decoratorQuery,
      heritageQuery,
      paramQuery,
    ];
    const restDeps = query(
      member.node,
      `Identifier:not(${otherQueries.join(', ')})`
    ).map((n) => toDep(DependencyOrigin.Declaration, n));

    // todo: improve dependency resolution for non exported file members

    // makes sure to not match any arbitrary name strings as actual dependency
    const hasMemberFileDependencyImport = (m: Member, d: Dependency) => {
      const file = member && this.getFileOfMember(member);
      return (
        file?.imports.some((i) => i.identifiers.includes(d.name)) ||
        file?.members.some((m2) => m2.name === d.name)
      );
    };

    return [...decoratorDeps, ...heritageDeps, ...paramDeps, ...restDeps]
      .filter((d) => this.hasMember(d.name) && d.name !== member.name)
      .filter((d) => hasMemberFileDependencyImport(member, d))
      .filter(dedupeBy((d) => d.name));
  }
}

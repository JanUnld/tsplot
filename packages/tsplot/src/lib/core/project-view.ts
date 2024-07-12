import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import {
  excludeNonExported,
  FilterSet,
  Predicate,
  SourceFileFilterFn,
} from '../filter';
import { dedupeBy, dedupeByMemberUniqueId, matchRegExpOrGlob } from '../utils';
import { Dependency, DependencyOrigin } from './dependency';
import { getMemberUniqueId, Member, MemberKind } from './member';
import {
  getOrphanMembersFromProjectView,
  getPathsWithMembersFromProjectView,
  Namespace,
  PathsLike,
} from './namespace';
import { getProjectFileFromSourceFile, ProjectFile } from './project-file';
import {
  getProgramFromProjectViewOptions,
  ProjectViewOptions,
} from './project-view-options';

/** @internal */
function coerceMemberName(memberOrName: Member | string) {
  return typeof memberOrName === 'string' ? memberOrName : memberOrName.name;
}

/** @internal */
function includeProjectFiles(
  ...pattern: (string | RegExp)[]
): Predicate<ProjectFile> {
  return (f) =>
    !pattern?.length ||
    pattern.some((p) => matchRegExpOrGlob(p, f.source.fileName));
}

export class ProjectView {
  private readonly _typeChecker: ts.TypeChecker;
  private readonly _program: ts.Program;
  private _namespaces: Namespace[] = [];
  private _files: ProjectFile[] = [];
  private _members: Member[] = [];
  private _orphans: Member[] = [];

  readonly filter = new FilterSet<Member>([excludeNonExported()]);

  get files(): ProjectFile[] {
    return this._files;
  }
  get members(): Member[] {
    return this.filter.apply(this._members);
  }

  get orphans(): Member[] {
    return this._orphans;
  }
  get namespaces(): Namespace[] {
    return this._namespaces;
  }

  constructor(options: ProjectViewOptions) {
    this._program = getProgramFromProjectViewOptions(options);
    this._typeChecker = this._program.getTypeChecker();

    if (options.memberFilter) {
      this.filter.add(...options.memberFilter);
    }

    this._initProjectFilesAndMembers(options.sourceFileFilter);
    this._initNamespacesAndOrphans(options.paths);
  }

  async getDependencyMembers(member: Member, options?: { depth?: number }) {
    let depth = options?.depth;

    let deps = member.deps
      .map((d) =>
        this.getMemberByName(d.name, {
          sourceFileName: d.node.getSourceFile().fileName,
        })
      )
      .filter(Boolean) as Member[];

    if (depth === 0)
      return deps.concat(member).filter(this.hasMember.bind(this));
    if (depth != null) depth--;

    for (const m of deps) {
      let members = (await this.getDependencyMembers(m, { depth })).filter(
        (m2) => ![m.name, m2.name].includes(member.name)
      );

      deps = [...members, ...deps].filter(dedupeByMemberUniqueId);
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

      dependents = [...members, ...dependents].filter(dedupeByMemberUniqueId);
    }

    return dependents.concat(member).filter(this.hasMember.bind(this));
  }

  getMembersOfKind(kind: MemberKind) {
    return this.members.filter((m) => m.kind === kind);
  }

  getMemberByName(
    name: string,
    options?: { sourceFileName?: string | RegExp }
  ) {
    return this.members.find((m) => {
      // checks whether the member is part of the source file if specified
      const isInSrc =
        !options?.sourceFileName ||
        matchRegExpOrGlob(
          options.sourceFileName,
          m.node.getSourceFile().fileName
        );

      // if not specified, we are just looking for the member by name which
      // will return the first occurrence of the member with the given name
      return isInSrc && m.name === name;
    });
  }

  getFileOfMember(member: Member) {
    return this.files.find((f) => f.members.includes(member));
  }

  getFilesByPattern(...pattern: (string | RegExp)[]) {
    return this.files.filter(includeProjectFiles(...pattern));
  }

  hasMember(memberOrName: Member | string) {
    const memberName = coerceMemberName(memberOrName);
    return this.members.some((m) => m.name === memberName);
  }

  getExportedMembersOfFile(
    ...filesOrPatterns: (string | RegExp | ProjectFile)[]
  ) {
    const exportedMembers = filesOrPatterns
      .flatMap((fileOrPattern) => {
        // firstly we need to identify whether we are dealing with a file or a pattern
        const isPattern =
          typeof fileOrPattern === 'string' || fileOrPattern instanceof RegExp;
        // and act accordingly to only handle project files in the next step
        return isPattern
          ? this.getFilesByPattern(fileOrPattern)
          : [fileOrPattern];
      })
      .flatMap<Member>((file) => {
        const fileSymbol = this._typeChecker.getSymbolAtLocation(file.source);
        if (!fileSymbol) return [];
        // secondly we are using the files to receive a symbol and from the symbol
        // onwards the actually exported symbol of that file "symbol". We then map
        // the exported "symbols" to their according member within the project view
        return this._typeChecker
          .getExportsOfModule(fileSymbol)
          .map((s) =>
            this.getMemberByName(s.name, {
              sourceFileName: s.declarations?.[0].getSourceFile().fileName,
            })
          )
          .filter(Boolean) as Member[];
      })
      // finally we dedupe the members since we cannot be sure whether there are
      // multiple occurrences due to the nature of the method signature
      .filter(dedupeByMemberUniqueId);

    return this.filter.apply(exportedMembers);
  }

  getProgram(): ts.Program {
    return this._program;
  }

  private _initProjectFilesAndMembers(filters?: SourceFileFilterFn[]) {
    const toMembers = (f: ProjectFile) => f.members;
    const files = FilterSet.with(filters ?? [])
      .apply(this._program.getSourceFiles() as ts.SourceFile[])
      .map((s) => getProjectFileFromSourceFile(s, this._typeChecker));

    this._files = files;
    this._members = files.flatMap(toMembers);

    this._files = files.map((file) => ({
      ...file,
      members: file.members.map((member) => ({
        ...member,
        uniqueName: this._getUniqueName(member),
        deps: this._getDirectDeps(member),
      })),
    }));
    this._members = this._files.flatMap(toMembers);
  }

  private _initNamespacesAndOrphans(paths?: PathsLike) {
    paths = paths ?? this.getProgram().getCompilerOptions().paths ?? {};

    const pathsWithMembers = getPathsWithMembersFromProjectView(this, paths);

    this._orphans = getOrphanMembersFromProjectView(this, pathsWithMembers);
    this._namespaces = Object.entries(pathsWithMembers).map(
      ([path, members]) => ({
        path,
        members,
      })
    );
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

  private _getUniqueName(member: Member) {
    const occurrenceIndex = this.members
      .filter((m) => m.name === member.name)
      .findIndex((m) => getMemberUniqueId(m) === getMemberUniqueId(member));

    return occurrenceIndex > 0
      ? `${member.name}_${occurrenceIndex}`
      : member.name;
  }
}

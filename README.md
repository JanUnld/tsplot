# tsplot

This project aims to provide a simple-to-use tool to automagically generate different
types of diagrams for TypeScript projects by analyzing the dependencies between files
and their members.

> [!WARNING]  
> This project is still in its early stages. Since most of the codebase is currently
> experimental, major changes shall be expected to happen!

## Usage

```bash
npx tsplot --help
```

> [!NOTE]  
> Make sure to take a look at the `--help` output of the subcommands as well, to get
> a full overview of the available options.

```
Usage: tsplot [options] [command]

Options:
  -h, --help         display help for command

Commands:
  diagram [options]  Generate different types of diagrams for a typescript project based on its dependency graph
  stats [options]    Generate statistics for a typescript project
  help [command]     display help for command
```

## Examples

These are examples showcasing a class diagram for this project.

> [!NOTE]  
> The diagrams might be outdated

### Plant UML

The shell command below...

```shell
npx tsplot diagram --project './tsconfig.json' \
  --exclude '**/cli/**' \
  --excludeTypes 'function' \
  --excludeTypes 'variable' \
  --excludeTypes 'type' \
  --output './tsplot.puml' \
  --edgeless
```

...generates the following Plant UML diagram:

![tsplot](./tsplot.svg)

### Mermaid

The shell command below...

```shell
npx tsplot diagram --project './tsconfig.json' \
  --exclude '**/cli/**' \
  --excludeTypes 'function' \
  --excludeTypes 'variable' \
  --excludeTypes 'type' \
  --output './tsplot.mmd' \
  --renderer 'mermaid' \
  --edgeless
```

...generates the following Mermaid diagram:

```mermaid
classDiagram
  class Import["Import"]
  <<interface>> Import
  Import : +ts.ImportDeclaration node
  Import : +string[] identifiers
  Import : +string src
  class Comment["Comment"]
  <<interface>> Comment
  Comment : +string text
  Comment : +number start
  Comment : +number end
  class ResolvedNode["ResolvedNode"]
  <<interface>> ResolvedNode
  ResolvedNode : +string selector
  ResolvedNode : +ts.Node node
  class TypeInfo["TypeInfo"]
  <<interface>> TypeInfo
  TypeInfo : +ts.Type type
  TypeInfo : +TypeInfoFormatFn typeToString
  class ReturnTypeInfo["ReturnTypeInfo"]
  <<interface>> ReturnTypeInfo
  ReturnTypeInfo : +ts.Type returnType
  ReturnTypeInfo : +TypeInfoFormatFn returnTypeToString
  class Decorator["Decorator"]
  <<interface>> Decorator
  Decorator : +ts.Decorator node
  Decorator : +string name
  class Dependency["Dependency"]
  <<interface>> Dependency
  Dependency : +DependencyOrigin origin
  Dependency : +ts.Node node
  Dependency : +string name
  class DependencyOrigin["DependencyOrigin"]
  <<enumeration>> DependencyOrigin
  DependencyOrigin : Declaration
  DependencyOrigin : Parameter
  DependencyOrigin : Decorator
  DependencyOrigin : Heritage
  class Field["Field"]
  <<interface>> Field
  Field : +string name
  class Parameter["Parameter"]
  <<interface>> Parameter
  Parameter : +ts.Node node
  Parameter : +string name
  class Method["Method"]
  <<interface>> Method
  Method : +string name
  Method : +Parameter[] params
  class Member["Member"]
  <<interface>> Member
  Member : +Dependency[] deps
  Member : +Decorator[] decorators
  Member : +Field[] fields
  Member : +Method[] methods
  Member : +Parameter[] params
  Member : +MemberKind kind
  Member : +string name
  Member : +boolean isExported
  Member : +boolean isAbstract
  class MemberKind["MemberKind"]
  <<enumeration>> MemberKind
  MemberKind : Class
  MemberKind : Interface
  MemberKind : Enum
  MemberKind : Function
  MemberKind : Type
  MemberKind : Variable
  class ProjectFile["ProjectFile"]
  <<interface>> ProjectFile
  ProjectFile : +ts.SourceFile source
  ProjectFile : +Import[] imports
  ProjectFile : +Member[] members
  class FilterSet["FilterSet"]
  FilterSet : #Set<Predicate<T>> predicates
  FilterSet : +FilterSet<T> with(Predicate<T>[] filters)$
  FilterSet : +this add(Predicate<T>[] ...filter)
  FilterSet : +this remove(Predicate<T>[] ...filter)
  FilterSet : +T[] apply(T[] target, options?)
  FilterSet : +Predicate<T> compose(options?)
  FilterSet : +Predicate<T>[] decompose()
  class FilterComposeOptions["FilterComposeOptions"]
  <<interface>> FilterComposeOptions
  FilterComposeOptions : +"every" | "some" method
class ProjectView["ProjectView"]
ProjectView : -ts.Program _program
ProjectView : -ts.TypeChecker _typeChecker
ProjectView : -ProjectFile[] _files
ProjectView : -Member[] _members
ProjectView : +FilterSet<Member> filters
ProjectView : +ProjectFile[] files
ProjectView : +Member[] members
ProjectView : +Promise<Member[]> getDependencyMembers(Member member, options?)
ProjectView : +Promise<Member[]> getDependentMembers(Member member, options?)
ProjectView : +Member[] getMembersOfKind(kind)
ProjectView : +Member | undefined getMemberByName(string name)
ProjectView : +ProjectFile | undefined getFileOfMember(Member member)
ProjectView : +boolean hasMember(memberOrName)
ProjectView : +Member[] | undefined getExportedMembersOfFile(ProjectFile file)
ProjectView : -ProjectFile[] _getProjectFiles(filters?)
ProjectView : -Dependency[] _getDirectDeps(Member member)
class ProjectViewOptions["ProjectViewOptions"]
<<interface>> ProjectViewOptions
ProjectViewOptions : +string tsConfigPath
ProjectViewOptions : +SourceFileFilterFn[] filters?
class Diagram["Diagram"]
<<abstract>> Diagram
Diagram : -Member[] _members
Diagram : +FilterSet<Member> filters
Diagram : +Member[] getMembers(options?)
Diagram : +string render()*
class DiagramOptions["DiagramOptions"]
<<interface>> DiagramOptions
DiagramOptions : +boolean nonExported?
DiagramOptions : +boolean fields?
DiagramOptions : +boolean methods?
class RelationDiagram["RelationDiagram"]
<<abstract>> RelationDiagram
RelationDiagram : +Member[] getMembers(options?)
RelationDiagram : +RelationEdge[] getEdges(options?)
class RelationEdge["RelationEdge"]
<<interface>> RelationEdge
RelationEdge : +RelationType type
RelationEdge : +Member from
RelationEdge : +Member to
class RelationDiagramOptions["RelationDiagramOptions"]
<<interface>> RelationDiagramOptions
RelationDiagramOptions : +boolean edgeless?
class RelationType["RelationType"]
<<enumeration>> RelationType
RelationType : Aggregation
RelationType : Association
RelationType : Composition
RelationType : Extension
class PlantUMLRenderOptions["PlantUMLRenderOptions"]
<<interface>> PlantUMLRenderOptions
class PlantUMLClassDiagram["PlantUMLClassDiagram"]
PlantUMLClassDiagram : +string render(options?)
class MermaidRenderOptions["MermaidRenderOptions"]
<<interface>> MermaidRenderOptions
class MermaidClassDiagram["MermaidClassDiagram"]
MermaidClassDiagram : +string render(options?)
DependencyOrigin..>Dependency
ResolvedNode--|>Field
TypeInfo--|>Field
TypeInfo--|>Parameter
ResolvedNode--|>Method
TypeInfo--|>Method
ReturnTypeInfo--|>Method
Parameter..>Method
ResolvedNode--|>Member
TypeInfo--|>Member
ReturnTypeInfo--|>Member
Dependency..>Member
Decorator..>Member
Field..>Member
Method..>Member
Parameter..>Member
MemberKind..>Member
Import..>ProjectFile
Member..>ProjectFile
FilterComposeOptions..>FilterSet
ProjectViewOptions..>ProjectView
ProjectFile..>ProjectView
Member..>ProjectView
FilterSet-->ProjectView
MemberKind..>ProjectView
Dependency..>ProjectView
Member..>Diagram
FilterSet-->Diagram
DiagramOptions..>Diagram
Member..>DiagramOptions
Diagram--|>RelationDiagram
RelationDiagramOptions..>RelationDiagram
Member..>RelationDiagram
FilterSet-->RelationDiagram
DiagramOptions..>RelationDiagram
RelationEdge..>RelationDiagram
RelationType..>RelationEdge
Member..>RelationEdge
DiagramOptions--|>RelationDiagramOptions
Member..>RelationDiagramOptions
RelationDiagramOptions--|>PlantUMLRenderOptions
RelationDiagram--|>PlantUMLClassDiagram
PlantUMLRenderOptions..>PlantUMLClassDiagram
RelationDiagramOptions--|>MermaidRenderOptions
RelationDiagram--|>MermaidClassDiagram
MermaidRenderOptions..>MermaidClassDiagram
```

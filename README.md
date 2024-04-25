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

### Mermaid

```mermaid
classDiagram
  class Import["Import"]
  <<interface>> Import
  Import : +node
  Import : +identifiers
  Import : +src
  class Comment["Comment"]
  <<interface>> Comment
  Comment : +text
  Comment : +start
  Comment : +end
  class ResolvedNode["ResolvedNode"]
  <<interface>> ResolvedNode
  ResolvedNode : +selector
  ResolvedNode : +node
  class Decorator["Decorator"]
  <<interface>> Decorator
  Decorator : +node
  Decorator : +name
  class Dependency["Dependency"]
  <<interface>> Dependency
  Dependency : +origin
  Dependency : +node
  Dependency : +name
  class DependencyOrigin["DependencyOrigin"]
  <<enumeration>> DependencyOrigin
  DependencyOrigin : Declaration
  DependencyOrigin : Parameter
  DependencyOrigin : Decorator
  DependencyOrigin : Heritage
  class Field["Field"]
  <<interface>> Field
  Field : +name
  class Parameter["Parameter"]
  <<interface>> Parameter
  Parameter : +node
  Parameter : +name
  class Method["Method"]
  <<interface>> Method
  Method : +name
  Method : +params
  class Member["Member"]
  <<interface>> Member
  Member : +deps
  Member : +decorators
  Member : +fields
  Member : +methods
  Member : +params
  Member : +type
  Member : +name
  Member : +isExported
  Member : +isAbstract
  class MemberType["MemberType"]
  <<enumeration>> MemberType
  MemberType : Class
  MemberType : Interface
  MemberType : Enum
  MemberType : Function
  MemberType : Type
  MemberType : Variable
  class ProjectFile["ProjectFile"]
  <<interface>> ProjectFile
  ProjectFile : +source
  ProjectFile : +imports
  ProjectFile : +members
  class FilterSet["FilterSet"]
  FilterSet : #predicates
  FilterSet : +with(filters)$
  FilterSet : +add(...filter)
  FilterSet : +remove(...filter)
  FilterSet : +apply(target, options?)
  FilterSet : +compose(options?)
  FilterSet : +decompose()
  class FilterComposeOptions["FilterComposeOptions"]
  <<interface>> FilterComposeOptions
  FilterComposeOptions : +method
  class ProjectView["ProjectView"]
  ProjectView : +filters
  ProjectView : +files
  ProjectView : +members
  ProjectView : +getDependencyMembers(member, options?)
  ProjectView : +getDependentMembers(member, options?)
  ProjectView : +getMembersOfType(type)
  ProjectView : +getMemberByName(name)
  ProjectView : +getFileOfMember(member)
  ProjectView : +hasMember(memberOrName)
  class Diagram["Diagram"]
  <<abstract>> Diagram
  Diagram : +filters
  Diagram : +getMembers(options?)
  Diagram : +render()*
  class DiagramFilterOptions["DiagramFilterOptions"]
  <<interface>> DiagramFilterOptions
  DiagramFilterOptions : +nonExported
  class RelationDiagram["RelationDiagram"]
  <<abstract>> RelationDiagram
  RelationDiagram : +getMembers(options?)
  RelationDiagram : +getEdges(options?)
  class RelationEdge["RelationEdge"]
  <<interface>> RelationEdge
  RelationEdge : +type
  RelationEdge : +from
  RelationEdge : +to
  class RelationDiagramFilterOptions["RelationDiagramFilterOptions"]
  <<interface>> RelationDiagramFilterOptions
  RelationDiagramFilterOptions : +edgeless
  class RelationType["RelationType"]
  <<enumeration>> RelationType
  RelationType : Aggregation
  RelationType : Association
  RelationType : Composition
  RelationType : Extension
  class PlantUMLClassDiagram["PlantUMLClassDiagram"]
  PlantUMLClassDiagram : +render(options?)
  class MermaidClassDiagram["MermaidClassDiagram"]
  MermaidClassDiagram : +render(options?)
  DependencyOrigin..>Dependency
  ResolvedNode--|>Field
  ResolvedNode--|>Method
  Parameter..>Method
  ResolvedNode--|>Member
  Dependency..>Member
  Decorator..>Member
  Field..>Member
  Method..>Member
  Parameter..>Member
  MemberType..>Member
  Import..>ProjectFile
  Member..>ProjectFile
  FilterComposeOptions..>FilterSet
  ProjectFile..>ProjectView
  Member..>ProjectView
  FilterSet-->ProjectView
  MemberType..>ProjectView
  Dependency..>ProjectView
  Member..>Diagram
  FilterSet-->Diagram
  DiagramFilterOptions..>Diagram
  Member..>DiagramFilterOptions
  Diagram--|>RelationDiagram
  RelationDiagramFilterOptions..>RelationDiagram
  Member..>RelationDiagram
  FilterSet-->RelationDiagram
  DiagramFilterOptions..>RelationDiagram
  RelationEdge..>RelationDiagram
  RelationType..>RelationEdge
  Member..>RelationEdge
  DiagramFilterOptions--|>RelationDiagramFilterOptions
  Member..>RelationDiagramFilterOptions
  RelationDiagram--|>PlantUMLClassDiagram
  RelationDiagramFilterOptions..>PlantUMLClassDiagram
  RelationDiagram--|>MermaidClassDiagram
  RelationDiagramFilterOptions..>MermaidClassDiagram
```

### Plant UML

![tsplot](./tsplot.svg)

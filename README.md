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
  class Import
  <<Interface>> Import
  class Decorator
  <<Interface>> Decorator
  class Dependency
  <<Interface>> Dependency
  class DependencyOrigin
  <<Enumeration>> DependencyOrigin
  class Member
  <<Interface>> Member
  class MemberType
  <<Enumeration>> MemberType
  class ProjectFile
  <<Interface>> ProjectFile
  class FilterSet
  class Predicate
  class SourceFileFilterFn
  class MemberFilterFn
  class ProjectView
  class Diagram
  <<Abstract>> Diagram
  class RelationDiagram
  <<Abstract>> RelationDiagram
  class RelationEdge
  <<Interface>> RelationEdge
  class RelationType
  <<Enumeration>> RelationType
  class PlantUMLClassDiagram
  class MermaidClassDiagram
  class Comment
  <<Interface>> Comment
  DependencyOrigin ..> Dependency
  Decorator ..> Member
  Dependency ..> Member
  MemberType ..> Member
  Import ..> ProjectFile
  Member ..> ProjectFile
  Predicate ..> FilterSet
  Predicate ..> SourceFileFilterFn
  Predicate ..> MemberFilterFn
  Member ..> MemberFilterFn
  SourceFileFilterFn ..> ProjectView
  ProjectFile ..> ProjectView
  Member ..> ProjectView
  FilterSet --> ProjectView
  MemberType ..> ProjectView
  Dependency ..> ProjectView
  Member ..> Diagram
  FilterSet --> Diagram
  Diagram --|> RelationDiagram
  Member ..> RelationDiagram
  RelationEdge ..> RelationDiagram
  RelationType ..> RelationEdge
  Member ..> RelationEdge
  RelationDiagram --|> PlantUMLClassDiagram
  RelationDiagram --|> MermaidClassDiagram
```

### Plant UML

![tsplot](packages/tsplot/tsplot.svg)

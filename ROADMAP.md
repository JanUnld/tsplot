# Roadmap

## Todos

- [x] Generate a project graph of the members and their dependencies
- [x] Generate a PlantUML diagram from the project graph
- [x] Add (some) filtering options
- [x] Implement a simple CLI prototype
- [x] Field and method support to member resolution
- [ ] Add namespacing support
- [ ] Type param support
- [ ] Provide more definite node typings for all interfaces (e.g. `Decorator.node` → `ts.Decorator`)
- [ ] Hotspot detection and visualization
- [ ] Use `ts.createProgram` and `ts.TypeChecker` to properly receive type information
  - This will involve a bit of refactoring of the currently static analysis of the source files
  - More extensive and accurate type information resolution (advanced types, alias types, etc.)
- [ ] Different diagram renderer
  - [x] PlantUML
  - [x] Mermaid
  - [ ] Graphviz!
  - [ ] D2
- [ ] Different types of diagrams
  - [x] Class diagram
  - [ ] Object diagram
  - [ ] _State diagram?_
  - [ ] _Sequence diagram?_
- [ ] Add documentation
- [ ] Add configuration file support
- [x] Publish to NPM
- [ ] Code cleanup
- [ ] Add tests
- [ ] Add CI/CD (GitHub Actions)
  - README updates (e.g. diagrams)
  - Publishing
  - Testing

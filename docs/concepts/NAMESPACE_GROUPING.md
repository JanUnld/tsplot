# Namespace grouping

1. Custom grouping by glob matching — _easiest_
   - `--groupBy 'tsplot/cli:\*\*/cli/**`'`
   - `--groupBy 'tsplot:*'` — fallthrough if nothing else matches
   - should allow multiple options
   - should allow ungrouped members without a group
2. Grouping by tsconfig paths — _hardest_
   - `--groupBy 'tsPaths'`
   - probably pretty complex, needs resolving of all actually exported members, same as with barrel index files
3. Grouping by file (module) — _medium_
   - `--groupBy 'filePath'` — full path including dir
   - `--groupBy 'fileName'` — only file name
   - `--groupBy 'folder'` — only folder path
   - paths should be relative to the project root
   - paths should only consist of the least relevant segments, expanding whenever duplicates would appear (e.g. `utils` → `lib/utils`, `cli/utils`)
4. Barrel index files — _hard_ (see `tsPaths` grouping above)
   - `--groupBy 'index'`
   - find barrel index files and group exported members together, this uses a similar approach as the `tsPaths` grouping

## Resolving exported members

Finding all exported members of a module is not trivial, especially when considering the different ways of exporting members in TypeScript.

The desired approach would be to use the TypeScript compiler API to resolve all exports of a module.

**[Example](https://stackoverflow.com/questions/56999775/how-to-get-exported-members-using-typescript-compiler-api)** — _src. Stack Overflow_

```typescript
const moduleExports = typeChecker.getExportsOfModule(symbol);

// this prints out ["member1", "member2", ...]
console.log(moduleExports.map(s => s.name));
```

This will require a bit of refactoring of the current static analysis of the source files, but it will provide more extensive and accurate type information resolution (advanced types, alias types, etc.). 

See `type-checking` branch for progress on the current refactoring effort.

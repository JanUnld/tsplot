# Namespace grouping

Namespace grouping is supposed to provide a way to group project members together. This might be useful to distinguish the higher order location a project member belongs to. For example, this project could be grouped into two namespaces: `tsplot` and `tsplot/cli`, but since the CLI code isn't exposed by itself, it's not necessary to create a separate namespace for it within the `tsconfig.json`. It's possible to manually define how a namespace should be cut using the following format:

```
namespace:pattern,pattern
```

The format can be summarized as follows:

- `namespace` <br>
  The name of the namespace that should be created
- `pattern,pattern` <br>
  A comma separated list of glob patterns that matches the files that should be included in the namespace

## API

When creating project views, you're able to define a typescript paths like structure that allows to group files together. By default, the project view instance will infer potential namespaces from the `tsconfig.json` paths.

```typescript
const projectView = new ProjectView({
  tsConfigPath,
  paths: {
    'tsplot': ['**/lib/**'],
    'tsplot/cli': ['**/cli/**'],
  }
});
```

Namespaces and potential orphaned project members can be accessed using the `namespaces` and `orphans` properties.

```typescript
projectView.namespaces; // { tsplot: [ ... ], 'tsplot/cli': [ ... ] }
projectView.orphans; // [ ... ]
```

## CLI

The CLI also integrates with this approach and allows to define grouping behavior using the `--groupBy` option.

> [!WARNING]  
> The CLI will not infer namespaces from the `tsconfig.json` paths by default. If you want to use this feature, you have to define the `--groupBy` option with the value `tsPaths`. This can be used in combination with manually set namespaces.

```bash
npx tsplot render class-diagram \
  --groupBy 'tsplot:**/lib/**' 'tsplot/cli:**/cli/**' \
  --output 'tsplot.puml'
```

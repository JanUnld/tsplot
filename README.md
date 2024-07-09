# tsplot

This project aims to provide a simple-to-use tool to automagically generate different types of diagrams and other templates for TypeScript projects by analyzing the dependencies between files and their members, while also resolving relevant type information.

> [!WARNING]  
> This project is still in its early stages. Since most of the codebase is currently experimental, major changes shall be expected to happen!

## Usage

```bash
npx tsplot --help
```

> [!NOTE]  
> Make sure to take a look at the `--help` output of the subcommands as well, to get a full overview of the available options.

```
Usage: tsplot [options] [command]

Options:
  -h, --help                   display help for command

Commands:
  diagram [options]            DEPRECATED! use "render <template>" command instead
  stats [options]              generate statistics for a typescript project
  render [options] <template>  renders typescript AST and type checker information to a desired target format using built-in and
                               custom templates (e.g. plant-uml, mermaid)
  help [command]               display help for command
```

## Templates

There are currently two template targets available:

- [`plant-uml`](https://plantuml.com/)
- [`mermaid`](https://mermaid-js.github.io/mermaid/#/)

They can be set using the `--target` option when using the `render` command.

### Custom templates

Built-in templates are implemented using [Nunjucks](https://mozilla.github.io/nunjucks/). They are available for the `plant-uml` and `mermaid` targets and can be extended. You can take a look at the implementation in [`lib/render2/templates`](./packages/tsplot/src/lib/render2/templates) for inspiration.

It is also possible to create custom templates. For more information, check the [template engine concept](./docs/concepts/TEMPLATE_ENGINE.md).

## Example

This is an example showcasing a class diagram for a subset of this project.

> [!NOTE]  
> The diagrams might be outdated

### Plant UML

Executing the shell command below:

```shell
npx tsplot render class-diagram \ 
  --output './example.puml' \
  --includeName 'Project*' 'Template*' 'render' 'RenderOptions' \
  --exclude '**/cli/**'
```

Generates the Plant UML code in [`example.puml`](./examples/example.puml), which results in the following diagram:

![example](./examples/example.svg)

A _full_ overview of this project looks like this:

![tsplot](./examples/tsplot.svg)

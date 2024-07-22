# tsplot

**Warning:** This project is still in its early stages. Since most of the codebase is currently experimental, major changes shall be expected to happen!

A CLI and tooling library to plot [Typescript][web-ts] project information to different template targets. Either using built-in targets, such as [PlantUML][web-puml] or [Mermaid][web-mmd], but also supporting custom templates and targets.

[web-ts]: https://www.typescriptlang.org
[web-puml]: https://plantuml.com
[web-mmd]: https://mermaid.js.org/

## Features

**Important:** This library does not render output in an image format! It's sole purpose is to generate the intermediate code for a declarative diagram dialect or any other text based output format, like markdown or html, to be further processed.

- **Full and partial project views** <br>
  A unified access point for a flat list of all members and files within a project view (e.g. classes, interfaces, enums, etc.) with the ability to filter and work with them.

- **Project member graphs** <br>
  Resolution of the relationships between members into a collection edges.

- **Namespace grouping** <br>
  Configurable grouping mechanism based on the common [Typescript paths][web-ts-paths] format.

- **Filtering** <br>
  Preset and custom filters to include or exclude project files and members based on various criteria (e.g. name, path, kind, decorators, etc.). Works as the basis for partial project views.

- **Rendering** <br>
  Template based output generation for different targets, such as [PlantUML][web-puml] or [Mermaid][web-mmd], with extensive customization support.

- **Template engine** <br>
  Customizable and extendable templating based on [Nunjucks][web-njk] for generating output code.

- **CLI** <br>
  A command line interface to interact with the library and generate output code with a rich set of options, that support all the library features.

  [web-ts-paths]: https://www.typescriptlang.org/tsconfig/#paths
  [web-njk]: https://mozilla.github.io/nunjucks/

## Usage

You can always use the help to get an overview of the available commands and options.

```bash
npx tsplot --help
```

**Tip:** Make sure to take a look at the `--help` output of the subcommands to get a full overview of the available options.

### Rendering

To render the project view and graph information you can use the `render` command. The following example generates a class diagram using the `plant-uml` target.

**Note:** The default output target is `plant-uml`. To change it, use the `--target` option.

```bash
npx tsplot render class-diagram --output './output.puml'
```

### Statistics

The CLI can collect and display various statistics about the project. Make sure the check the options available for the `stats` command using the `--help` option.

```bash
npx tsplot stats
```

## Templates

Templates are used to generate the output code for a target format. This project tries to provide a fair amount of configuration options for the different output formats, but it is also possible to create custom templates and targets.

Following are the built-in targets:

- [`plant-uml`][web-puml]
- [`mermaid`][web-mmd]

They can be set using the `--target` option when using the `render` command.

Built-in templates are implemented using [Nunjucks][web-njk] and can also be customized and extended. For more information, check the [template engine concept](./docs/concepts/TEMPLATE_ENGINE.md). You can also take a look at the template implementations in [`lib/render2/templates`](./packages/tsplot/src/lib/render2/templates) for inspiration.

## Examples

This is an example showcasing a class diagram for a subset of this project.

**Note:** The diagrams might be outdated.

### PlantUML

Executing the shell command below:

```shell
$tsp render class-diagram \ 
  --project $tsconfig \ 
  --output './tsplot.project-view.puml' \
  --groupBy 'tsplot/core:**/lib/core/**' 'tsplot/filter:**/lib/filter/**' \
  --exclude '**/utils/**' '**/cli/**' \
  --excludeKind 'variable' 'function' \
  --from 'ProjectView' \
  --depth 0
```

Generates the PlantUML code in [`example.puml`](assets/puml/example.puml), which results in the following diagram:

![example](assets/svg/example.svg)

A _full_ overview of this project might look like this:

![tsplot](assets/svg/tsplot.svg)

Using the following command:

```shell
npx tsplot render class-diagram \
  --project './packages/tsplot/tsconfig.lib.json' \
  --groupBy 'tsplot:**/lib/**' 'tsplot/cli:**/cli/**' \
  --exclude '**/render/**' '**/utils/**' \
  --excludeKind 'variable' 'function' \
  --output './tsplot.puml'
```

---

Make sure to check the [roadmap](./ROADMAP.md) and [concept](./docs/concepts) documents for more information about the library and its features.

# Template Engine

For a more streamlined and easier way to render diagram files in various dialects (e.g. PlantUML, Mermaid), it's a good idea to integrate a lightweight template engine. This will allow for more flexible diagram generation, as well as the ability to add custom templates and variables.

Template languages and engines are a solved problem, so it won't be necessary to create a new _standalone_ solution for this project. There are various template engines available for JavaScript and TypeScript. The following option is the one currently implemented in this project:

- [Nunjucks](https://mozilla.github.io/nunjucks/) — _preferred_ <br>
  Provides straight-forward IDE support due to being a superset of Twig, Jinja2, and Liquid

## Rendering a Diagram

The following is an example of how to render a class-diagram using the Nunjucks template engine:

```typescript
import { render, ProjectView, KnownTemplate, KnownTarget } from 'tsplot';

const projectView = new ProjectView({ tsConfigPath });

const puml = render(KnownTemplate.ClassDiagram, {
  target: KnownTarget.PlantUML,
  context: { projectView }
});
```

## Customizing Templates

Templates can be customized quite easily either by overwriting or extending already existing templates. The following is an example of how to extend the class-diagram template:

```nunjucks
{# templates/plant-uml/class-diagram.njk #}
{% extends 'tsplot/puml/class-diagram.njk' %}

{% block member %}
  {% include 'plant-uml/member.njk' %}
{% endblock %}
```

```nunjucks
{# templates/plant-uml/member.njk #}
{% extends 'tsplot/puml/member.njk' %}

{% block class %}
{# Skip all the fields and methods and render just the member name #}
class {{ member.name }}
{% endblock %}
```

The newly created template can then be used in the rendering process:

```typescript
const puml = render(KnownTemplate.ClassDiagram, {
  baseDir: resolve(__dirname, 'templates'),
  target: KnownTarget.PlantUML,
  context: { projectView }
});
```

### Customizing Targets

The `target` option can be used to specify a custom template target. This can be useful when creating custom templates for a specific target (unknown by tsplot internally). The following is an example of a markdown template that renders a list of classes and interfaces in a project:

> [!TIP] 
> It might be useful to create an `.editorconfig` or similar formatting configuration to ensure that the generated markdown files are formatted as desired. If you're using the builtin Nunjucks renderer, you can also take a look at the [whitespace controlling guide](https://mozilla.github.io/nunjucks/templating.html#whitespace-control)

```nunjucks
{# templates/mardkown/list.njk #}
{% set memberKindsToRender = [ 'class', 'interface' ] %}
{% for memberKind in memberKindsToRender %}
# {{ memberKind | capitalize }}s
{% for member in projectView.getMemberOfKind(memberKind) %}
- `{{ member.name }}`
{% endfor %}
{% endfor %}
```

The newly created template and target can then be used in the rendering process:

```typescript
const md = render('list', {
  baseDir: resolve(__dirname, 'templates'),
  target: 'markdown',
  context: { projectView }
});
```

## CLI Integration

The `tsplot` CLI also allows customizing templates and targets when invoking the `render` command. The following is an example of how to render the [markdown example](#customizing-targets) from the previous section using the CLI:

```bash
tsplot render list --target markdown --baseDir './templates' --output './list.md'
```

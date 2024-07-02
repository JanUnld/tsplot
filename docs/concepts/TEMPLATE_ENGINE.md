# Template Engine

For a more streamlined and easier way to render diagram files in various dialects (e.g. PlantUML, Mermaid), it's a good idea to integrate a lightweight template engine. This will allow for more flexible diagram generation, as well as the ability to add custom templates and variables.

Template languages and engines are a solved problem, so it won't be necessary to create a new _standalone_ solution for this project. There are various template engines available for JavaScript and TypeScript. The following option is the one currently implemented in this project:

- [Nunjucks](https://mozilla.github.io/nunjucks/) — _preferred_ <br>
  Provides straight-forward IDE support due to being a superset of Twig, Jinja2, and Liquid

## Rendering a Diagram

The following is an example of how to render a class-diagram using the Nunjucks template engine:

```typescript
import { render, ProjectView, ProjectGraph, BuiltInTemplate, BuiltInTemplateTarget } from 'tsplot';

const projectView = new ProjectView({ tsConfigPath });

const puml = render(BuiltInTemplate.ClassDiagram, {
  target: BuiltInTemplateTarget.PlantUML,
  context: { projectView }
});
```

## Customizing Templates

Templates can be customized quite easily either by overwriting or extending already existing templates. The following is an example of how to extend the class-diagram template (e.g. `.tsplot/templates/custom/class-diagram.njk`):

```nunjucks
{% extends 'puml/class-diagram.njk' %}

{% block member %}
  {% include 'custom/member.njk' %}
{% endblock %}
```

The newly created template can then be used in the rendering process:

```typescript
import { resolve } from 'path';

const puml = render('class-diagram', {
  baseDir: resolve(__dirname, '.tsplot/templates'),
  context: { projectView },
  target: 'custom'
});
```

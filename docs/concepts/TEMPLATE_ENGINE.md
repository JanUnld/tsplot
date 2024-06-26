# Template Engine

For a more streamlined and easier way to render diagram files in various dialects (e.g. PlantUML, Mermaid), it's a good idea to integrate a lightweight template engine. This will allow for more flexible diagram generation, as well as the ability to add custom templates and variables.

Template languages and engines are a solved problem, so it won't be necessary to create a new _standalone_ solution for this project. There are various template engines available for JavaScript and TypeScript, such as:

- [Handlebars](https://handlebarsjs.com/)
- [EJS](https://ejs.co/)
- [Pug](https://pugjs.org/api/getting-started.html)
- [Mustache](https://mustache.github.io/)
- [Nunjucks](https://mozilla.github.io/nunjucks/) — _preferred_ <br>
  Provides straight-forward IDE support due to being a superset of Twig, Jinja2, and Liquid
- [Liquid](https://shopify.github.io/liquid/)
- [doT](http://olado.github.io/doT/)
- [Marko](https://markojs.com/)
- [Hogan.js](http://twitter.github.io/hogan.js/)
- [Dust](http://www.dustjs.com/)
- [Swig](https://node-swig.github.io/swig-templates/)
- [Squirrelly](https://squirrelly.js.org/) — _performance beast_

## Example

Here's an example of a simple Nunjucks template that renders a PlantUML class diagram (e.g. `classDiagram.njk`):

```nunjucks
{% extends "plant-uml/base.njk" %}

{% block content %}
' Members
{% for member in members %}
  {% if member.kind === 'class' %}
    {% include 'plant-uml/member/class.njk' %}
  {% elif member.kind === 'interface' %}
    {% include 'plant-uml/member/interface.njk' %}
  {% elif member.kind === 'enum' %}
    {% include 'plant-uml/member/enum.njk' %}
  {# elif ... #}
  {% endif %}
{% endfor %}
' Edges
{% for edge in edges %}
  {{ edge.from.name }}->{{ edge.to.name }}
{% endfor %}
{% endblock %}
```

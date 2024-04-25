import { EOL } from 'os';
import { RelationEdge } from 'tsplot';
import { Field, Member, MemberType, Method, Parameter } from '../../core';
import { AccessModifiers, indent } from '../../utils';
import {
  renderEdgeConnection,
  renderNameQuoted,
  renderVisibility,
} from '../renderer';

/** @internal */
function renderSuffixClassifiers(am: AccessModifiers): string {
  const abstractTag = am.isAbstract ? '*' : '';
  const staticTag = am.isStatic ? '$' : '';

  return [abstractTag, staticTag].join('');
}

/** @internal */
function renderAnnotation(m: Member): string {
  let annotation = '';
  switch (m.type) {
    // case ?:
    //   annotation = 'service';
    //   break;
    case 'class':
      if (m.isAbstract) {
        annotation = 'abstract';
      }
      break;
    case 'enum':
      annotation = 'enumeration';
      break;
    case 'interface':
      annotation = 'interface';
      break;
  }

  return annotation ? `<<${annotation}>>` : '';
}

function renderMemberIdentifier(m: Member): string {
  return `${m.name} :`;
}

/** @internal */
function renderField(f: Field, member: Member) {
  const visibility = member.type !== MemberType.Enum ? renderVisibility(f) : '';
  const field = [visibility, f.name, renderSuffixClassifiers(f)].join('');
  return `${renderMemberIdentifier(member)} ${field}`;
}

/** @internal */
function renderMethod(m: Method, member: Member): string {
  const params = m.params.map(renderParameter).join(', ');
  const method = [
    renderVisibility(m),
    `${m.name}(${params})`,
    renderSuffixClassifiers(m),
  ].join('');

  return `${renderMemberIdentifier(member)} ${method}`;
}

/** @internal */
function renderParameter(p: Parameter): string {
  return `${p.isRest ? '...' : ''}${p.name}${p.isOptional ? '?' : ''}`;
}

/** @internal */
export function renderMember(m: Member): string {
  const annotation = renderAnnotation(m);
  const contents = [
    `class ${m.name}[${renderNameQuoted(m)}]`,
    annotation ? `${annotation} ${m.name}` : '',
    m.fields.map((f) => renderField(f, m)).join(EOL),
    m.methods.map((m2) => renderMethod(m2, m)).join(EOL),
  ];

  return contents.filter((str) => !!str).join(EOL);
}

/** @internal */
export function renderEdge(e: RelationEdge): string {
  const from = e.from.name;
  const to = e.to.name;

  return `${from}${renderEdgeConnection(e)}${to}`;
}

/** @internal */
export function renderMermaid(
  diagramType: 'classDiagram',
  ...contents: string[]
): string {
  return diagramType + EOL + indent(contents.join(EOL));
}

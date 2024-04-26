import { EOL } from 'os';
import { RelationDiagramOptions, RelationEdge } from 'tsplot';
import { Field, Member, MemberType, Method, Parameter } from '../../core';
import { AccessModifiers, indent } from '../../utils';
import { joinAndNormalizeSpace } from '../../utils/space';
import {
  renderEdgeConnection,
  renderNameQuoted,
  renderOptional,
  renderVisibility,
} from '../renderer';

export interface MermaidRenderOptions extends RelationDiagramOptions {}

/** @internal */
function renderSuffixClassifiers(am: AccessModifiers): string {
  const abstractTag = am.isAbstract ? '*' : '';
  const staticTag = am.isStatic ? '$' : '';

  return joinAndNormalizeSpace([abstractTag, staticTag], { separator: '' });
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
  const field = joinAndNormalizeSpace(
    [visibility, f.name, renderOptional(f), renderSuffixClassifiers(f)],
    { separator: '' }
  );
  return `${renderMemberIdentifier(member)} ${field}`;
}

/** @internal */
function renderMethod(m: Method, member: Member): string {
  const params = m.params.map(renderParameter).join(', ');
  const method = joinAndNormalizeSpace(
    [renderVisibility(m), `${m.name}(${params})`, renderSuffixClassifiers(m)],
    { separator: '' }
  );

  return `${renderMemberIdentifier(member)} ${method}`;
}

/** @internal */
function renderParameter(p: Parameter): string {
  return `${p.isRest ? '...' : ''}${p.name}${renderOptional(p)}`;
}

/** @internal */
export function renderMember(
  m: Member,
  options?: MermaidRenderOptions
): string {
  const annotation = renderAnnotation(m);

  let contents = [
    `class ${m.name}[${renderNameQuoted(m)}]`,
    annotation ? `${annotation} ${m.name}` : '',
  ];

  const shouldRenderFields = !!m.fields?.length && options?.fields !== false;
  const shouldRenderMethods = !!m.methods?.length && options?.methods !== false;

  if (shouldRenderFields) {
    contents = [...contents, m.fields.map((f) => renderField(f, m)).join(EOL)];
  }
  if (shouldRenderMethods) {
    contents = [
      ...contents,
      m.methods.map((m2) => renderMethod(m2, m)).join(EOL),
    ];
  }

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

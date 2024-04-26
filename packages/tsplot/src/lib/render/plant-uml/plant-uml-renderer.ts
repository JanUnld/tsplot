import { EOL } from 'os';
import { RelationDiagramOptions, RelationEdge } from 'tsplot';
import { Field, Member, MemberType, Method, Parameter } from '../../core';
import { AccessModifiers, indent } from '../../utils';
import {
  renderEdgeConnection,
  renderNameQuoted,
  renderVisibility,
} from '../renderer';

/** @internal */
export interface PlantUMLRenderOptions extends RelationDiagramOptions {}

/** @internal */
function renderAccessModifiers(
  am: AccessModifiers,
  memberType: MemberType
): string {
  const visibility = memberType !== MemberType.Enum ? renderVisibility(am) : '';
  const abstractTag = am.isAbstract ? '{abstract}' : '';
  const staticTag = am.isStatic ? '{static}' : '';

  return [visibility, abstractTag, staticTag].join(' ').trim();
}

/** @internal */
function getShapeTypeFromMember(m: Member): string {
  let type: string;
  switch (m.type) {
    case 'class':
    case 'interface':
    case 'enum':
      type = m.type;
      if (m.isAbstract && type === 'class') {
        type = `abstract ${type}`;
      }
      break;
    case 'type':
      type = 'interface';
      break;
    case 'function':
      type = 'protocol';
      break;
    default:
      type = 'entity';
      break;
  }
  return type;
}

/** @internal */
function renderField(f: Field, member: Member): string {
  return `${renderAccessModifiers(f, member.type)} {field} ${f.name}`;
}

/** @internal */
function renderMethod(m: Method, member: Member): string {
  const params = m.params.map(renderParameter).join(', ');
  return `${renderAccessModifiers(m, member.type)} {method} ${
    m.name
  }(${params})`;
}

/** @internal */
function renderParameter(p: Parameter): string {
  return `${p.isRest ? '...' : ''}${p.name}${p.isOptional ? '?' : ''}`;
}

/** @internal */
export function renderMember(
  m: Member,
  options?: PlantUMLRenderOptions
): string {
  const shapeType = getShapeTypeFromMember(m);
  const stereotype = m.decorators
    ?.map((d) => d.name)
    .filter(Boolean)
    .join(', ');

  const isFunction = m.type === MemberType.Function;
  const name = renderNameQuoted(m);

  let str = `${shapeType} ${name}${stereotype ? ` <<${stereotype}>>` : ''}`;

  const shouldRenderFields = !!m.fields?.length && options?.fields !== false;
  const shouldRenderMethods = !!m.methods?.length && options?.methods !== false;
  const shouldRenderParams = !!m.params?.length;

  const shouldRenderBlock =
    shouldRenderFields || shouldRenderMethods || shouldRenderParams;

  if (shouldRenderBlock) {
    // render a block opening whenever we have fields, methods, or params
    str += ` {${EOL}`;
  }

  if (isFunction) {
    const params = m.params.map(renderParameter).join(EOL);

    if (shouldRenderParams) {
      str += indent('..Parameters..') + EOL;
      str += indent(params) + EOL;
    }
  } else {
    if (shouldRenderFields) {
      const fields = m.fields.map((f) => renderField(f, m)).join(EOL);

      str += indent(fields) + EOL;
    }

    if (shouldRenderMethods) {
      const methods = m.methods.map((m2) => renderMethod(m2, m)).join(EOL);

      str += indent(methods) + EOL;
    }
  }

  if (shouldRenderBlock) {
    // also close the block that we opened earlier
    str += `}`;
  }

  return str;
}

/** @internal */
export function renderEdge(e: RelationEdge): string {
  const from = renderNameQuoted(e.from);
  const to = renderNameQuoted(e.to);

  return `${from}${renderEdgeConnection(e)}${to}`;
}

/** @internal */
export function renderPlantUml(...contents: string[]) {
  return '@startuml' + EOL + contents.join(EOL) + EOL + '@enduml;';
}

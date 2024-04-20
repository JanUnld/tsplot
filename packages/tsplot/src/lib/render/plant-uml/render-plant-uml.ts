import { EOL } from 'os';

/** @internal */
export function renderPlantUml(...contents: string[]) {
  return '@startuml' + EOL + contents.join(EOL) + EOL + '@enduml;';
}

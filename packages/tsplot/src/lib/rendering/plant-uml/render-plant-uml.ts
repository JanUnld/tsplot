import { EOL } from 'os';

export function renderPlantUml(...contents: string[]) {
  return '@startuml' + EOL + contents.join(EOL) + EOL + '@enduml;';
}

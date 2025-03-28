import * as ts from 'typescript';
import { createSourceFile, createTestingProgram, TestingProgram } from '../../testing';

describe('ProjectMemberDiscovery', () => {
  const TS = ts;

  let program: TestingProgram;
  let sourceFile: ts.SourceFile;

  beforeEach(() => {
    sourceFile = createSourceFile('class Foo { foo = "bar"; }');
    program = createTestingProgram([sourceFile]);
  });

  it('should be able to discover nodes from a source file', () => {
    // const members = discovery.fromSourceFile(sourceFile);
    // const [member] = members;
    //
    // expect(members).toHaveLength(1);
    // expect(member).toHaveProperty('foo');
    // expect(member.foo).toEqual('bar');
  });
});

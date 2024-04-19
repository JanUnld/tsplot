import * as ts from 'typescript';

/** @experimental */
export interface Comment {
  text: string;
  start: number;
  end: number;
}

/** @experimental */
export function getLeadingCommentsFromNode(
  node: ts.Node,
  source: ts.SourceFile
): Comment[] {
  const src = source.getFullText();
  const ranges = ts.getLeadingCommentRanges(src, node.getFullStart()) ?? [];

  return ranges
    .filter((r) => r.kind === ts.SyntaxKind.MultiLineCommentTrivia)
    .map(({ pos: start, end }) => ({
      start,
      end,
      text: src.slice(start, end),
    }));
}

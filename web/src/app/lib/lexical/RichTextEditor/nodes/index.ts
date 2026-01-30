import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { MarkNode } from "@lexical/mark";
import { OverflowNode } from "@lexical/overflow";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import type { Klass, LexicalNode } from "lexical";

// Type assertion needed due to Lexical version mismatch between packages
// Breaking into smaller groups to avoid excessive stack depth error
const basicNodes = [HeadingNode, QuoteNode] as unknown as Klass<LexicalNode>[];
const listNodes = [ListNode, ListItemNode] as unknown as Klass<LexicalNode>[];
const codeNodes = [CodeNode, CodeHighlightNode] as unknown as Klass<LexicalNode>[];
const tableNodes = [TableNode, TableCellNode, TableRowNode] as unknown as Klass<LexicalNode>[];
const linkNodes = [AutoLinkNode, LinkNode] as unknown as Klass<LexicalNode>[];
const miscNodes = [HashtagNode, OverflowNode, HorizontalRuleNode, MarkNode] as unknown as Klass<LexicalNode>[];

const PlaygroundNodes: Klass<LexicalNode>[] = [
  ...basicNodes,
  ...listNodes,
  ...codeNodes,
  ...tableNodes,
  ...linkNodes,
  ...miscNodes
];

export default PlaygroundNodes;

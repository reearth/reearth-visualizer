import type { EditorThemeClasses } from "lexical";

import "./DefaultLexicalEditorTheme.css";

const theme: EditorThemeClasses = {
  blockCursor: "DefaultLexicalEditorTheme__blockCursor",
  characterLimit: "DefaultLexicalEditorTheme__characterLimit",
  code: "DefaultLexicalEditorTheme__code",
  codeHighlight: {
    atrule: "DefaultLexicalEditorTheme__tokenAttr",
    attr: "DefaultLexicalEditorTheme__tokenAttr",
    boolean: "DefaultLexicalEditorTheme__tokenProperty",
    builtin: "DefaultLexicalEditorTheme__tokenSelector",
    cdata: "DefaultLexicalEditorTheme__tokenComment",
    char: "DefaultLexicalEditorTheme__tokenSelector",
    class: "DefaultLexicalEditorTheme__tokenFunction",
    "class-name": "DefaultLexicalEditorTheme__tokenFunction",
    comment: "DefaultLexicalEditorTheme__tokenComment",
    constant: "DefaultLexicalEditorTheme__tokenProperty",
    deleted: "DefaultLexicalEditorTheme__tokenProperty",
    doctype: "DefaultLexicalEditorTheme__tokenComment",
    entity: "DefaultLexicalEditorTheme__tokenOperator",
    function: "DefaultLexicalEditorTheme__tokenFunction",
    important: "DefaultLexicalEditorTheme__tokenVariable",
    inserted: "DefaultLexicalEditorTheme__tokenSelector",
    keyword: "DefaultLexicalEditorTheme__tokenAttr",
    namespace: "DefaultLexicalEditorTheme__tokenVariable",
    number: "DefaultLexicalEditorTheme__tokenProperty",
    operator: "DefaultLexicalEditorTheme__tokenOperator",
    prolog: "DefaultLexicalEditorTheme__tokenComment",
    property: "DefaultLexicalEditorTheme__tokenProperty",
    punctuation: "DefaultLexicalEditorTheme__tokenPunctuation",
    regex: "DefaultLexicalEditorTheme__tokenVariable",
    selector: "DefaultLexicalEditorTheme__tokenSelector",
    string: "DefaultLexicalEditorTheme__tokenSelector",
    symbol: "DefaultLexicalEditorTheme__tokenProperty",
    tag: "DefaultLexicalEditorTheme__tokenProperty",
    url: "DefaultLexicalEditorTheme__tokenOperator",
    variable: "DefaultLexicalEditorTheme__tokenVariable"
  },
  embedBlock: {
    base: "DefaultLexicalEditorTheme__embedBlock",
    focus: "DefaultLexicalEditorTheme__embedBlockFocus"
  },
  hashtag: "DefaultLexicalEditorTheme__hashtag",
  heading: {
    h1: "DefaultLexicalEditorTheme__h1",
    h2: "DefaultLexicalEditorTheme__h2",
    h3: "DefaultLexicalEditorTheme__h3",
    h4: "DefaultLexicalEditorTheme__h4",
    h5: "DefaultLexicalEditorTheme__h5",
    h6: "DefaultLexicalEditorTheme__h6"
  },
  image: "editor-image",
  indent: "DefaultLexicalEditorTheme__indent",
  inlineImage: "inline-editor-image",
  layoutContainer: "DefaultLexicalEditorTheme__layoutContaner",
  layoutItem: "DefaultLexicalEditorTheme__layoutItem",
  link: "DefaultLexicalEditorTheme__link",
  list: {
    listitem: "DefaultLexicalEditorTheme__listItem",
    listitemChecked: "DefaultLexicalEditorTheme__listItemChecked",
    listitemUnchecked: "DefaultLexicalEditorTheme__listItemUnchecked",
    nested: {
      listitem: "DefaultLexicalEditorTheme__nestedListItem"
    },
    olDepth: [
      "DefaultLexicalEditorTheme__ol1",
      "DefaultLexicalEditorTheme__ol2",
      "DefaultLexicalEditorTheme__ol3",
      "DefaultLexicalEditorTheme__ol4",
      "DefaultLexicalEditorTheme__ol5"
    ],
    ul: "DefaultLexicalEditorTheme__ul"
  },
  ltr: "DefaultLexicalEditorTheme__ltr",
  mark: "DefaultLexicalEditorTheme__mark",
  markOverlap: "DefaultLexicalEditorTheme__markOverlap",
  paragraph: "DefaultLexicalEditorTheme__paragraph",
  quote: "DefaultLexicalEditorTheme__quote",
  rtl: "DefaultLexicalEditorTheme__rtl",
  table: "DefaultLexicalEditorTheme__table",
  tableAddColumns: "DefaultLexicalEditorTheme__tableAddColumns",
  tableAddRows: "DefaultLexicalEditorTheme__tableAddRows",
  tableCell: "DefaultLexicalEditorTheme__tableCell",
  tableCellActionButton: "DefaultLexicalEditorTheme__tableCellActionButton",
  tableCellActionButtonContainer:
    "DefaultLexicalEditorTheme__tableCellActionButtonContainer",
  tableCellEditing: "DefaultLexicalEditorTheme__tableCellEditing",
  tableCellHeader: "DefaultLexicalEditorTheme__tableCellHeader",
  tableCellPrimarySelected:
    "DefaultLexicalEditorTheme__tableCellPrimarySelected",
  tableCellResizer: "DefaultLexicalEditorTheme__tableCellResizer",
  tableCellSelected: "DefaultLexicalEditorTheme__tableCellSelected",
  tableCellSortedIndicator:
    "DefaultLexicalEditorTheme__tableCellSortedIndicator",
  tableResizeRuler: "DefaultLexicalEditorTheme__tableCellResizeRuler",
  tableSelected: "DefaultLexicalEditorTheme__tableSelected",
  tableSelection: "DefaultLexicalEditorTheme__tableSelection",
  text: {
    bold: "DefaultLexicalEditorTheme__textBold",
    code: "DefaultLexicalEditorTheme__textCode",
    italic: "DefaultLexicalEditorTheme__textItalic",
    strikethrough: "DefaultLexicalEditorTheme__textStrikethrough",
    subscript: "DefaultLexicalEditorTheme__textSubscript",
    superscript: "DefaultLexicalEditorTheme__textSuperscript",
    underline: "DefaultLexicalEditorTheme__textUnderline",
    underlineStrikethrough:
      "DefaultLexicalEditorTheme__textUnderlineStrikethrough"
  }
};

export default theme;

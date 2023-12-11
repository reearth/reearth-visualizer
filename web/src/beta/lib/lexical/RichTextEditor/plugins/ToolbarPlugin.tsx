import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection";
import { $isTableNode } from "@lexical/table";
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import type { ElementFormatType, LexicalEditor, RangeSelection } from "lexical";
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  DEPRECATED_$isGridSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_MODIFIER_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useState, useMemo, RefObject } from "react";

import { useT } from "@reearth/services/i18n";

import DropDown, { DropDownItem } from "../ui/DropDown";
import DropdownColorPicker from "../ui/DropdownColorPicker";
import { getSelectedNode } from "../utils/getSelectedNode";
import { sanitizeUrl } from "../utils/url";

const IS_APPLE = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const rootTypeToRootName = {
  root: "Root",
  table: "Table",
};

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
  ["Noto Sans JP", "Noto Sans JP"],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ["10px", "10px"],
  ["12px", "12px"],
  ["14px", "14px"],
  ["16px", "16px"],
  ["18px", "18px"],
  ["20px", "20px"],
  ["22px", "22px"],
  ["24px", "24px"],
  ["26px", "26px"],
  ["28px", "28px"],
  ["32px", "32px"],
  ["36px", "36px"],
  ["40px", "40px"],
  ["64px", "64px"],
];

const LINE_HEIGHT_OPTIONS: [string, string][] = [
  ["1.0", "1.0"],
  ["1.1", "1.1"],
  ["1.2", "1.2"],
  ["1.3", "1.3"],
  ["1.4", "1.4"],
  ["1.5", "1.5"],
  ["1.6", "1.6"],
  ["1.7", "1.7"],
  ["1.8", "1.8"],
  ["1.9", "1.9"],
  ["2.0", "2.0"],
];

// Fix for $patchStyleText not updating the style correctly
// https://github.com/facebook/lexical/issues/4491#issuecomment-1701890592
function $customPatchStyleText(selection: RangeSelection, cssProperty: string, cssValue: string) {
  $patchStyleText(selection, { [cssProperty]: cssValue });

  const newStyle = replaceCssStyle(selection.style, cssProperty, cssValue);
  selection.setStyle(newStyle);
}

function replaceCssStyle(
  existingCssStyle: string,
  cssProperty: string,
  newCssValue: string,
): string {
  const cssArr = existingCssStyle
    .split(";")
    .filter(prop => !!prop)
    .map(prop => prop.trim());

  let found = false;

  const newCssArr = cssArr.map(prop => {
    const propertySplit = prop.split(":");
    if (propertySplit.length !== 2) {
      return "";
    }

    const [property, value] = propertySplit.map(p => p.trim());

    if (property === cssProperty) {
      found = true;
      return `${property}: ${newCssValue}`;
    } else {
      return `${property}: ${value}`;
    }
  });

  // If the property was not found in the existing styles, add it
  if (!found) {
    newCssArr.push(`${cssProperty}: ${newCssValue}`);
  }

  return newCssArr.filter(value => value !== "").join("; ");
}

function dropDownActiveClass(active: boolean) {
  if (active) return "active dropdown-item-active";
  else return "";
}

function BlockFormatDropDown({
  containerRef,
  scrollableContainerId,
  blockTypeToBlockName,
  editor,
  blockType,
  disabled = false,
}: {
  containerRef: RefObject<HTMLDivElement>;
  scrollableContainerId?: string;
  blockTypeToBlockName: { [key: string]: string };
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const t = useT();
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  return (
    <DropDown
      disabled={disabled}
      containerRef={containerRef}
      scrollableContainerId={scrollableContainerId}
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={"icon block-type " + blockType}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style">
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "paragraph")}
        onClick={formatParagraph}>
        <i className="icon paragraph" />
        <span className="text">{t("Normal")}</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "h1")}
        onClick={() => formatHeading("h1")}>
        <i className="icon h1" />
        <span className="text">{t("Heading 1")}</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "h2")}
        onClick={() => formatHeading("h2")}>
        <i className="icon h2" />
        <span className="text">{t("Heading 2")}</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "h3")}
        onClick={() => formatHeading("h3")}>
        <i className="icon h3" />
        <span className="text">{t("Heading 3")}</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "bullet")}
        onClick={formatBulletList}>
        <i className="icon bullet-list" />
        <span className="text">{t("Bullet List")}</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "number")}
        onClick={formatNumberedList}>
        <i className="icon numbered-list" />
        <span className="text">{t("Numbered List")}</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "quote")}
        onClick={formatQuote}>
        <i className="icon quote" />
        <span className="text">{t("Quote")}</span>
      </DropDownItem>
    </DropDown>
  );
}

function Divider(): JSX.Element {
  return <div className="divider" />;
}

function FontDropDown({
  containerRef,
  scrollableContainerId,
  editor,
  value,
  style,
  disabled = false,
}: {
  containerRef: RefObject<HTMLDivElement>;
  scrollableContainerId?: string;
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const t = useT();
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $customPatchStyleText(selection, style, option);
        }
      });
    },
    [editor, style],
  );

  const buttonAriaLabel = useMemo(
    () =>
      style === "font-family"
        ? t("Formatting options for font family")
        : t("Formatting options for font size"),
    [style, t],
  );
  return (
    <DropDown
      containerRef={containerRef}
      scrollableContainerId={scrollableContainerId}
      disabled={disabled}
      buttonClassName={"toolbar-item " + style}
      buttonLabel={value}
      buttonIconClassName={style === "font-family" ? "icon block-type font-family" : ""}
      buttonAriaLabel={buttonAriaLabel}>
      {(style === "font-family" ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(([option, text]) => (
        <DropDownItem
          className={`item ${dropDownActiveClass(value === option)} ${
            style === "font-size" ? "fontsize-item" : ""
          }`}
          onClick={() => handleClick(option)}
          key={option}>
          <span className="text">{text}</span>
        </DropDownItem>
      ))}
    </DropDown>
  );
}

function LineHeightDropDown({
  containerRef,
  scrollableContainerId,
  editor,
  value,
  style,
  disabled = false,
}: {
  containerRef: RefObject<HTMLDivElement>;
  scrollableContainerId?: string;
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const t = useT();
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $customPatchStyleText(selection, style, option);
        }
      });
    },
    [editor, style],
  );

  return (
    <DropDown
      containerRef={containerRef}
      scrollableContainerId={scrollableContainerId}
      disabled={disabled}
      buttonClassName={"toolbar-item " + style}
      buttonIconClassName={"icon block-type lineheight"}
      buttonAriaLabel={t("Formatting options for line height")}>
      {LINE_HEIGHT_OPTIONS.map(([option, text]) => (
        <DropDownItem
          className={`item ${dropDownActiveClass(value === option)} ${"lineheight-item"}`}
          onClick={() => handleClick(option)}
          key={option}>
          <span className="text">{text}</span>
        </DropDownItem>
      ))}
    </DropDown>
  );
}

function ElementFormatDropdown({
  containerRef,
  scrollableContainerId,
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  containerRef: RefObject<HTMLDivElement>;
  scrollableContainerId?: string;
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  const t = useT();

  const formatOptions: {
    [key: string]: { icon: string; name: string };
  } = useMemo(
    () => ({
      center: {
        icon: "center-align",
        name: t("Center Align"),
      },
      justify: {
        icon: "justify-align",
        name: t("Justify Align"),
      },
      left: {
        icon: "left-align",
        name: t("Left Align"),
      },
      right: {
        icon: "right-align",
        name: t("Right Align"),
      },
    }),
    [t],
  );

  return (
    <DropDown
      containerRef={containerRef}
      scrollableContainerId={scrollableContainerId}
      disabled={disabled}
      buttonLabel={formatOptions[value]?.name}
      buttonIconClassName={`icon ${formatOptions[value]?.icon}`}
      buttonClassName="toolbar-item spaced alignment"
      buttonAriaLabel="Formatting options for text alignment">
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="item">
        <i className="icon left-align" />
        <span className="text">{t("Left Align")}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="item">
        <i className="icon center-align" />
        <span className="text">{t("Center Align")}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="item">
        <i className="icon right-align" />
        <span className="text">{t("Right Align")}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="item">
        <i className="icon justify-align" />
        <span className="text">{t("Justify Align")}</span>
      </DropDownItem>
      <Divider />
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        }}
        className="item">
        <i className={"icon " + (isRTL ? "indent" : "outdent")} />
        <span className="text">{t("Outdent")}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }}
        className="item">
        <i className={"icon " + (isRTL ? "outdent" : "indent")} />
        <span className="text">{t("Indent")}</span>
      </DropDownItem>
    </DropDown>
  );
}

export default function ToolbarPlugin({
  containerRef,
  scrollableContainerId,
}: {
  containerRef: RefObject<HTMLDivElement>;
  scrollableContainerId?: string;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [rootType, setRootType] = useState<keyof typeof rootTypeToRootName>("root");
  const [fontSize, setFontSize] = useState<string>("16px");
  const [fontColor, setFontColor] = useState<string>("#000");
  const [lineHeight, setLineHeight] = useState<string>("1.2");
  const [bgColor, setBgColor] = useState<string>("#fff");
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const t = useT();

  const blockTypeToBlockName = useMemo(
    () => ({
      paragraph: t("Normal"),
      h1: t("Heading 1"),
      h2: t("Heading 2"),
      h3: t("Heading 3"),
      bullet: t("Bulleted List"),
      number: t("Numbered List"),
      quote: t("Quote"),
    }),
    [t],
  );

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, e => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType("table");
      } else {
        setRootType("root");
      }

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }
      // Handle buttons
      setFontSize($getSelectionStyleValueForProperty(selection, "font-size", "16px"));
      setFontColor($getSelectionStyleValueForProperty(selection, "color", "#000"));
      setBgColor($getSelectionStyleValueForProperty(selection, "background-color", "#fff"));
      setFontFamily($getSelectionStyleValueForProperty(selection, "font-family", "Arial"));
      setLineHeight($getSelectionStyleValueForProperty(selection, "line-height", "1.2"));
      setElementFormat(
        ($isElementNode(node) ? node.getFormatType() : parent?.getFormatType()) || "left",
      );
    }
  }, [activeEditor, blockTypeToBlockName]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener(editable => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      payload => {
        const event: KeyboardEvent = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === "KeyK" && (ctrlKey || metaKey)) {
          event.preventDefault();
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [activeEditor, isLink]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [activeEditor],
  );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, idx) => {
          // We split the first and last node by the selection
          // So that we don't format unselected text inside those nodes
          if ($isTextNode(node)) {
            if (idx === 0 && anchor.offset !== 0) {
              node = node.splitText(anchor.offset)[1] || node;
            }
            if (idx === nodes.length - 1) {
              node = node.splitText(focus.offset)[0] || node;
            }

            if (node.__style !== "") {
              node.setStyle("");
            }
            if (node.__format !== 0) {
              node.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(node).setFormat("");
            }
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat("");
          }
        });
      }
    });
  }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ color: value });
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ "background-color": value });
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div className="toolbar">
      <div className="toolbar-line">
        <button
          disabled={!canUndo || !isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
          type="button"
          className="toolbar-item spaced"
          aria-label="Undo">
          <i className="format undo" />
        </button>
        <button
          disabled={!canRedo || !isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          title={IS_APPLE ? "Redo (⌘Y)" : "Redo (Ctrl+Y)"}
          type="button"
          className="toolbar-item"
          aria-label="Redo">
          <i className="format redo" />
        </button>
        <Divider />
        {blockType in blockTypeToBlockName && activeEditor === editor && (
          <>
            <BlockFormatDropDown
              containerRef={containerRef}
              scrollableContainerId={scrollableContainerId}
              disabled={!isEditable}
              blockType={blockType}
              rootType={rootType}
              editor={editor}
              blockTypeToBlockName={blockTypeToBlockName}
            />
            <Divider />
          </>
        )}
        <ElementFormatDropdown
          containerRef={containerRef}
          scrollableContainerId={scrollableContainerId}
          disabled={!isEditable}
          value={elementFormat}
          editor={editor}
          isRTL={isRTL}
        />
      </div>

      <div className="toolbar-line">
        <FontDropDown
          containerRef={containerRef}
          scrollableContainerId={scrollableContainerId}
          disabled={!isEditable}
          style={"font-family"}
          value={fontFamily}
          editor={editor}
        />
        <FontDropDown
          containerRef={containerRef}
          scrollableContainerId={scrollableContainerId}
          disabled={!isEditable}
          style={"font-size"}
          value={fontSize}
          editor={editor}
        />
        <LineHeightDropDown
          containerRef={containerRef}
          scrollableContainerId={scrollableContainerId}
          disabled={!isEditable}
          style={"line-height"}
          value={lineHeight}
          editor={editor}
        />
        <Divider />
      </div>

      <div className="toolbar-line">
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          className={"toolbar-item spaced " + (isBold ? "active" : "")}
          title={IS_APPLE ? "Bold (⌘B)" : "Bold (Ctrl+B)"}
          type="button"
          aria-label={`Format text as bold. Shortcut: ${IS_APPLE ? "⌘B" : "Ctrl+B"}`}>
          <i className="format bold" />
        </button>
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          className={"toolbar-item spaced " + (isItalic ? "active" : "")}
          title={IS_APPLE ? "Italic (⌘I)" : "Italic (Ctrl+I)"}
          type="button"
          aria-label={`Format text as italics. Shortcut: ${IS_APPLE ? "⌘I" : "Ctrl+I"}`}>
          <i className="format italic" />
        </button>
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          }}
          className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
          title={IS_APPLE ? "Underline (⌘U)" : "Underline (Ctrl+U)"}
          type="button"
          aria-label={`Format text to underlined. Shortcut: ${IS_APPLE ? "⌘U" : "Ctrl+U"}`}>
          <i className="format underline" />
        </button>
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
          }}
          className={"toolbar-item spaced " + (isCode ? "active" : "")}
          title={t("Insert Code Block")}
          type="button"
          aria-label="Insert code block">
          <i className="format code" />
        </button>
        <button
          disabled={!isEditable}
          onClick={insertLink}
          className={"toolbar-item spaced " + (isLink ? "active" : "")}
          aria-label="Insert link"
          title={t("Insert Link")}
          type="button">
          <i className="format link" />
        </button>
        <DropdownColorPicker
          containerRef={containerRef}
          scrollableContainerId={scrollableContainerId}
          disabled={!isEditable}
          buttonClassName="toolbar-item color-picker"
          buttonAriaLabel="Formatting text color"
          buttonIconClassName="icon font-color"
          color={fontColor}
          onChange={onFontColorSelect}
          title={t("Text Color")}
        />
        <DropdownColorPicker
          containerRef={containerRef}
          scrollableContainerId={scrollableContainerId}
          disabled={!isEditable}
          buttonClassName="toolbar-item color-picker"
          buttonAriaLabel="Formatting background color"
          buttonIconClassName="icon bg-color"
          color={bgColor}
          onChange={onBgColorSelect}
          title={t("Background Color")}
        />
        <DropDown
          containerRef={containerRef}
          scrollableContainerId={scrollableContainerId}
          disabled={!isEditable}
          buttonClassName="toolbar-item spaced"
          buttonLabel=""
          buttonAriaLabel="Formatting options for additional text styles"
          buttonIconClassName="icon dropdown-more">
          <DropDownItem
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
            }}
            className={"item " + dropDownActiveClass(isStrikethrough)}
            title="Strikethrough"
            aria-label="Format text with a strikethrough">
            <i className="icon strikethrough" />
            <span className="text">{t("Strikethrough")}</span>
          </DropDownItem>
          <DropDownItem
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
            }}
            className={"item " + dropDownActiveClass(isSubscript)}
            title="Subscript"
            aria-label="Format text with a subscript">
            <i className="icon subscript" />
            <span className="text">{t("Subscript")}</span>
          </DropDownItem>
          <DropDownItem
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
            }}
            className={"item " + dropDownActiveClass(isSuperscript)}
            title="Superscript"
            aria-label="Format text with a superscript">
            <i className="icon superscript" />
            <span className="text">{t("Superscript")}</span>
          </DropDownItem>
          <DropDownItem
            onClick={clearFormatting}
            className="item"
            title="Clear text formatting"
            aria-label="Clear all text formatting">
            <i className="icon clear" />
            <span className="text">{t("Clear Formatting")}</span>
          </DropDownItem>
        </DropDown>
      </div>
    </div>
  );
}

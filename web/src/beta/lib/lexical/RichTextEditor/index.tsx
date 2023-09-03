import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState } from "lexical";
import { debounce } from "lodash-es";
import { useMemo, useCallback, useRef } from "react";

import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import "./index.css";

import Nodes from "./nodes";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import SwitchEditModePlugin from "./plugins/SwitchEditModePlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import DefaultLexicalEditorTheme from "./themes/DefaultLexicalEditorTheme";

type EditorStateJSONString = string;

type Props = {
  editMode?: boolean;
  text?: EditorStateJSONString;
  hidePlaceholder?: boolean; // when in published page we don't want to show placeholder
  scrollableContainerId?: string;
  onChange?: (text: EditorStateJSONString) => void;
};

const RichTextEditor: React.FC<Props> = ({
  editMode = true,
  text,
  hidePlaceholder,
  scrollableContainerId,
  onChange,
}) => {
  const t = useT();
  const editorStateJSONStringRef = useRef<EditorStateJSONString>();

  const editorConfig = useMemo(
    () => ({
      namespace: "richtext-editor",
      editable: false,
      theme: DefaultLexicalEditorTheme,
      editorState: isEditorStateJSONString(text)
        ? text
        : `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"${
            text ?? ""
          }","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`,
      onError(error: Error) {
        console.error(error);
      },
      nodes: [...Nodes],
    }),
    [text],
  );

  const onStateChange = useCallback(
    (editorState: EditorState) => {
      const editorStateJSONString = JSON.stringify(editorState);
      if (editorStateJSONString !== editorStateJSONStringRef.current) {
        editorStateJSONStringRef.current = editorStateJSONString;
        onChange?.(editorStateJSONString);
      }
    },
    [editorStateJSONStringRef, onChange],
  );

  const debouncedOnStateChange = useMemo(() => debounce(onStateChange, 1000), [onStateChange]);

  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container" ref={editorRef}>
        {editMode && (
          <ToolbarPlugin containerRef={editorRef} scrollableContainerId={scrollableContainerId} />
        )}
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`editor-input ${editMode ? "editor-input-editable" : ""}`}
              />
            }
            placeholder={
              !hidePlaceholder ? (
                <StyledPlaceholder className="editor-placeholder">
                  {t("Write your story :)")}
                </StyledPlaceholder>
              ) : null
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <OnChangePlugin onChange={debouncedOnStateChange} />
          <SwitchEditModePlugin editable={editMode} />
          <FloatingLinkEditorPlugin scrollableContainerId={scrollableContainerId} />
        </div>
      </div>
    </LexicalComposer>
  );
};

export default RichTextEditor;

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.content.weaker};
`;

const isEditorStateJSONString = (str?: string) => {
  if (!str) return false;
  try {
    return JSON.parse(str).root !== undefined;
  } catch (e) {
    return false;
  }
};

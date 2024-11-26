import { OnMount } from "@monaco-editor/react";
import { Button, CodeInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import HtmlEditModal from "./HtmlEditModal";
import { getLanguageByFileExtension } from "./utils";

type Props = {
  fileTitle: string;
  sourceCode: string;
  onChangeSourceCode: (value: string | undefined) => void;
  executeCode: () => void;
};

const MATCH_PATTERNS = [
  /reearth\.ui\.show\((['"`])([\s\S]*?)\1\)/,
  /reearth\.modal\.show\((['"`])([\s\S]*?)\1\)/,
  /reearth\.popup\.show\((['"`])([\s\S]*?)\1\)/
];

const Code: FC<Props> = ({
  fileTitle,
  sourceCode,
  onChangeSourceCode,
  executeCode
}) => {
  const [isHtmlEditable, setIsHtmlEditable] = useState(false);
  const [editableHtmlSourceCode, setEditableHtmlSourceCode] = useState<
    string | null
  >(null);
  const [isOpenedHtmlEditor, setIsOpenedHtmlEditor] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<RegExpExecArray | null>(
    null
  );

  /**
   * カーソル位置に対応するHTML文字列とマッチ情報を取得
   */
  const getMatchAtCursor = useCallback(
    (value: string, offset: number): RegExpExecArray | null => {
      for (const pattern of MATCH_PATTERNS) {
        const match = pattern.exec(value);
        if (match) {
          const start = match.index;
          const end = start + match[0].length;
          if (offset > start && offset < end) {
            return match;
          }
        }
      }
      return null;
    },
    []
  );

  const handleCursorPositionChange = useCallback(
    (editor) => {
      const model = editor.getModel();
      if (!model) return;

      const value = model.getValue();
      const offset = model.getOffsetAt(editor.getPosition());

      const match = getMatchAtCursor(value, offset);
      if (match) {
        setCurrentMatch(match);
        setEditableHtmlSourceCode(match[2]); // 引数内の文字列
        setIsHtmlEditable(true);
      } else {
        setCurrentMatch(null);
        setEditableHtmlSourceCode(null);
        setIsHtmlEditable(false);
      }
    },
    [getMatchAtCursor]
  );

  const applyUpdatedHtml = useCallback(
    (newHtml: string) => {
      if (!currentMatch) return;

      const [fullMatch, delimiter] = currentMatch;
      const start = currentMatch.index;
      const end = start + fullMatch.length;

      const updatedSourceCode =
        sourceCode.slice(0, start) +
        `reearth.${fullMatch.split(".")[1]}.show(${delimiter}${newHtml}${delimiter})` +
        sourceCode.slice(end);

      onChangeSourceCode(updatedSourceCode);
      setIsOpenedHtmlEditor(false);
    },
    [currentMatch, sourceCode, onChangeSourceCode]
  );

  const onMount: OnMount = useCallback(
    (editor) => {
      editor.onDidChangeCursorPosition(() =>
        handleCursorPositionChange(editor)
      );
    },
    [handleCursorPositionChange]
  );

  return (
    <>
      <Wrapper>
        <Header>
          <Button icon="playRight" iconButton onClick={executeCode} />
          <Button
            icon="pencilSimple"
            title="HTML Editor"
            disabled={!isHtmlEditable}
            onClick={() => setIsOpenedHtmlEditor(true)}
          />
          <p>Widget</p>
        </Header>
        <CodeInput
          language={getLanguageByFileExtension(fileTitle)}
          value={sourceCode}
          onChange={onChangeSourceCode}
          onMount={onMount}
        />
      </Wrapper>
      {isOpenedHtmlEditor && editableHtmlSourceCode && (
        <HtmlEditModal
          isOpened={isOpenedHtmlEditor}
          sourceCode={editableHtmlSourceCode}
          onClose={() => setIsOpenedHtmlEditor(false)}
          onSubmit={applyUpdatedHtml}
        />
      )}
    </>
  );
};

const Header = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
}));

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  height: "100%"
}));

export default Code;

import { OnMount } from "@monaco-editor/react";
import { Button, CodeInput, IconButton } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { getLanguageByFileExtension } from "../utils";

import HtmlEditModal from "./HtmlEditModal";

type Props = {
  fileTitle: string;
  sourceCode: string;
  onChangeSourceCode: (value: string | undefined) => void;
  executeCode: () => void;
};

const REEARTH_HTML_INJECTION_PATTERNS = [
  /reearth\.ui\.show\((['"`])([\s\S]*?)\1\)/g,
  /reearth\.modal\.show\((['"`])([\s\S]*?)\1\)/g,
  /reearth\.popup\.show\((['"`])([\s\S]*?)\1\)/g
];

const Code: FC<Props> = ({
  fileTitle,
  sourceCode,
  onChangeSourceCode,
  executeCode
}) => {
  const [editableHtmlSourceCode, setEditableHtmlSourceCode] = useState<
    string | null
  >(null);
  const [isOpenedHtmlEditor, setIsOpenedHtmlEditor] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<RegExpExecArray | null>(
    null
  );

  const t = useT();

  const getMatchAtCursor = useCallback(
    (value: string, offset: number): RegExpExecArray | null => {
      for (const pattern of REEARTH_HTML_INJECTION_PATTERNS) {
        const re = new RegExp(pattern.source, pattern.flags);
        const matches = Array.from(value.matchAll(re));
        for (const match of matches) {
          const start = match.index;
          const end = start + match[0].length;
          if (offset >= start && offset <= end) {
            return match;
          }
        }
      }
      return null;
    },
    []
  );

  const onMount: OnMount = useCallback(
    (editor) => {
      const listener = editor.onDidChangeCursorPosition(() => {
        const model = editor.getModel();
        if (!model) return;

        const value = model.getValue();
        const offset = model.getOffsetAt(editor.getPosition());

        const match = getMatchAtCursor(value, offset);
        if (match) {
          setCurrentMatch(match);
          setEditableHtmlSourceCode(match[2]);
        } else {
          setCurrentMatch(null);
          setEditableHtmlSourceCode(null);
        }
      });

      editor.onDidDispose(() => {
        listener.dispose();
      });
    },
    [getMatchAtCursor]
  );

  const onSubmitHtmlEditor = useCallback(
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

  return (
    <>
      <Wrapper>
        <Header>
          <IconButton
            icon="playRight"
            tooltipText={t("Run Code")}
            placement="top"
            size="large"
            hasBorder
            onClick={executeCode}
          />
          <Button
            icon="pencilSimple"
            title={t("HTML Editor")}
            disabled={!editableHtmlSourceCode}
            onClick={() => setIsOpenedHtmlEditor(true)}
          />
        </Header>
        <CodeInput
          language={getLanguageByFileExtension(fileTitle)}
          value={sourceCode}
          onChange={onChangeSourceCode}
          onMount={onMount}
        />
      </Wrapper>
      {editableHtmlSourceCode && isOpenedHtmlEditor && (
        <HtmlEditModal
          isOpened={isOpenedHtmlEditor}
          sourceCode={editableHtmlSourceCode}
          onClose={() => setIsOpenedHtmlEditor(false)}
          onSubmit={onSubmitHtmlEditor}
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

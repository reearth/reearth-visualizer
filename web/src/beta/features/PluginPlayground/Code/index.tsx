import { OnMount } from "@monaco-editor/react";
import { Button, CodeInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import HtmlEditModal from "./HtmlEditModal";
import {
  extractHtmlFromSourceCode,
  getLanguageByFileExtension,
  injectHtmlIntoSourceCode
} from "./utils";

type Props = {
  fileTitle: string;
  sourceCode: string;
  onChangeSourceCode: (value: string | undefined) => void;
  executeCode: () => void;
};

const Code: FC<Props> = ({
  fileTitle,
  sourceCode,
  onChangeSourceCode,
  executeCode
}) => {
  const editableHtmlSourceCode = useMemo(
    () => extractHtmlFromSourceCode(sourceCode),
    [sourceCode]
  );

  const onSubmitHtmlEditor = useCallback(
    (newHtml: string) => {
      onChangeSourceCode(injectHtmlIntoSourceCode(newHtml, sourceCode));
    },
    [sourceCode, onChangeSourceCode]
  );

  const [isOpenedHtmlEditor, setIsOpenedHtmlEditor] = useState(false);

  const onMount: OnMount = useCallback((editor) => {
    editor.onDidChangeCursorPosition((e) => {
      const model = editor.getModel();
      if (!model) return;

      const value = model.getValue();
      const offset = model.getOffsetAt(e.position);

      const patterns = [
        /reearth\.ui\.show\((['"`])([\s\S]*?)\1\)/,
        /reearth\.modal\.show\((['"`])([\s\S]*?)\1\)/,
        /reearth\.popup\.show\((['"`])([\s\S]*?)\1\)/
      ];

      const matchedString = patterns.reduce<string | null>(
        (result, pattern) => {
          if (result) return result;

          const match = pattern.exec(value);

          if (match) {
            const start = match.index;
            const end = start + match[0].length;
            if (offset > start && offset < end) {
              return match[2];
            }
          }
          return null;
        },
        null
      );
      return matchedString;
    });
  }, []);

  return (
    <>
      <Wrapper>
        <Header>
          <Button icon="playRight" iconButton onClick={executeCode} />
          <Button
            icon="pencilSimple"
            title="HTML Editor"
            disabled={!editableHtmlSourceCode}
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
      {isOpenedHtmlEditor && (
        <HtmlEditModal
          isOpened={isOpenedHtmlEditor}
          sourceCode={editableHtmlSourceCode ?? ""}
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

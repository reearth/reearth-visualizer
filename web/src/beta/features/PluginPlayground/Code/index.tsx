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
  const ediableHtmlSourceCode = useMemo(
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

  return (
    <>
      <Wrapper>
        <Header>
          <Button icon="playRight" iconButton onClick={executeCode} />
          <Button
            icon="pencilSimple"
            title="HTML Editor"
            disabled={ediableHtmlSourceCode === undefined}
            onClick={() => setIsOpenedHtmlEditor(true)}
          />
          <p>Widget</p>
        </Header>
        <CodeInput
          language={getLanguageByFileExtension(fileTitle)}
          value={sourceCode}
          onChange={onChangeSourceCode}
        />
      </Wrapper>
      {isOpenedHtmlEditor && (
        <HtmlEditModal
          isOpened={isOpenedHtmlEditor}
          sourceCode={ediableHtmlSourceCode ?? ""}
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

import { Button, CodeInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import HtmlEditorModal from "./HtmlEditModal";

const getHtmlSourceCode = (sourceCode: string) => {
  const regex = /reearth\.ui\.show\(\s*`([^]*?)`\s*\);/g;
  const match = regex.exec(sourceCode);
  return match?.[1];
};

const getNewSourceCode = (htmlSourceCode: string, sourceCode: string) => {
  const regex = /reearth\.ui\.show\(\s*`([^]*?)`\s*\);/g;
  return sourceCode.replace(regex, `reearth.ui.show(\`${htmlSourceCode}\`);`);
};

type Props = {
  fileTitle: string;
  sourceCode: string;
  onChangeSourceCode: (value: string | undefined) => void;
  executeCode: () => void;
};

const getLanguageByFileExtension = (fileTitle: string) => {
  const ext = fileTitle.split(".").pop();
  switch (ext) {
    case "js":
      return "javascript";
    case "yml":
    case "yaml":
      return "yaml";
    default:
      return "plaintext";
  }
};

const Code: FC<Props> = ({
  fileTitle,
  sourceCode,
  onChangeSourceCode,
  executeCode
}) => {
  const ediableHtmlSourceCode = useMemo(
    () => getHtmlSourceCode(sourceCode),
    [sourceCode]
  );

  const onSubmitHtmlEditor = useCallback(
    (newSourceCode: string) => {
      onChangeSourceCode(getNewSourceCode(newSourceCode, sourceCode));
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
        <HtmlEditorModal
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

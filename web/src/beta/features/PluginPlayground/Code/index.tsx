import { Button, CodeInput, Modal } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

type Props = {
  fileName: string;
  sourceCode: string;
};

const getLanguageByFileName = (fileName: string) => {
  const ext = fileName.split(".").pop();
  switch (ext) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "json":
      return "json";
    case "yml":
    case "yaml":
      return "yaml";
    default:
      return "plaintext";
  }
};

const Code: FC<Props> = ({ fileName, sourceCode }) => {
  const [visible, setVisible] = useState(false);

  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <Wrapper>
      <Header>
        <Button icon="playRight" iconButton />
        <Button icon="pencilSimple" title="HTML Editor" onClick={handleOpen} />
        <p>Widget</p>
      </Header>
      <CodeInput
        language={getLanguageByFileName(fileName)}
        value={sourceCode}
      />
      <Modal size="small" visible={visible}>
        <div>
          <CodeInput
            language="html"
            value={document.documentElement.outerHTML}
            height={500}
          />
        </div>
      </Modal>
    </Wrapper>
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

import { Button, CodeInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type Props = {
  fileName: string;
  sourceCode: string;
};

const getLanguageByFileExtension = (fileName: string) => {
  const ext = fileName.split(".").pop();
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

const Code: FC<Props> = ({ fileName, sourceCode }) => {
  return (
    <Wrapper>
      <Header>
        <Button icon="playRight" iconButton />
        <p>Widget</p>
      </Header>
      <CodeInput
        language={getLanguageByFileExtension(fileName)}
        value={sourceCode}
      />
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

import { Button, Icon } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/styled";
import { FC, useState } from "react";

// TODO Implement: display uploaded files
const mockPlugins = [
  {
    id: "1",
    name: "My Plugin"
  },
  {
    id: "2",
    name: "My Plugin"
  }
];

type Props = {
  files: {
    name: string;
    sourceCode: string;
  }[];
  selectedFile: {
    name: string;
    sourceCode: string;
  };
  selectFile: (fileName: string, sourceCode: string) => void;
  handleFileUpload: () => void;
};

const Plugins: FC<Props> = ({
  files,
  selectFile,
  selectedFile,
  handleFileUpload
}) => {
  const [selectedPlugin, setSelectedPlugin] = useState<number>(0);

  const onClickPluginItem = (i: number) => {
    setSelectedPlugin(i);
  };

  return (
    <Wrapper>
      <PluginListWrapper>
        <PluginList>
          {mockPlugins.map((plugin, i) => (
            <PluginListItem
              key={plugin.id}
              selected={selectedPlugin === i}
              onClick={() => onClickPluginItem(i)}
            >
              {plugin.name}
            </PluginListItem>
          ))}
        </PluginList>
      </PluginListWrapper>
      <FileListWrapper>
        <ButtonsWrapper>
          <Button icon="plus" title="File" />
          <Button title="Upload" onClick={handleFileUpload} />
        </ButtonsWrapper>
        <FileList>
          {files.map((file) => (
            <FileListItem
              key={file.name}
              selected={selectedFile.name === file.name}
              onClick={() => selectFile(file.name, file.sourceCode)}
            >
              <Icon icon="file" />
              {file.name}
            </FileListItem>
          ))}
        </FileList>
      </FileListWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  display: "flex",
  height: "100%"
}));

const PluginListWrapper = styled("div")(() => ({
  display: "flex",
  width: "50%",
  padding: "4px"
}));

const PluginList = styled("ul")(() => ({
  width: "100%",
  padding: "0",
  margin: "0",
  listStyle: "none"
}));

const PluginListItem = styled("li")<{
  selected?: boolean;
}>(({ theme, selected }) => ({
  paddingTop: theme.spacing.smallest,
  paddingRight: theme.spacing.small,
  paddingLeft: theme.spacing.normal,
  paddingBottom: theme.spacing.smallest,
  borderRadius: theme.radius.small,
  backgroundColor: selected ? theme.select.main : "transparent",
  cursor: "pointer",
  "&:not(:first-child)": {
    marginTop: theme.spacing.smallest
  }
}));

const FileListWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: "4px",
  width: "50%",
  borderLeft: `1px solid ${theme.outline.weaker}`,
  gap: theme.spacing.small
}));

const FileList = styled("ul")(() => ({
  width: "100%",
  padding: "0",
  margin: "0",
  listStyle: "none"
}));

const FileListItem = styled("li")<{
  selected?: boolean;
}>(({ theme, selected }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
  paddingTop: theme.spacing.smallest,
  paddingRight: theme.spacing.small,
  paddingLeft: theme.spacing.normal,
  paddingBottom: theme.spacing.smallest,
  borderRadius: theme.radius.small,
  backgroundColor: selected ? theme.select.main : "transparent",
  cursor: "pointer",
  "&:not(:first-child)": {
    marginTop: theme.spacing.smallest
  }
}));

const ButtonsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest
}));

export default Plugins;

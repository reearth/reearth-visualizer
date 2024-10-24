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

const mockFiles = [
  {
    id: "1",
    name: "widget.js"
  },
  {
    id: "2",
    name: "table.js"
  },
  {
    id: "3",
    name: "reearth.yml"
  }
];

const Plugins: FC = () => {
  const [selectedPlugin, setSelectedPlugin] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<number>(0);

  const onClickPluginItem = (i: number) => {
    setSelectedPlugin(i);
  };

  const onClickFileItem = (i: number) => {
    setSelectedFile(i);
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
          <Button title="Upload" />
        </ButtonsWrapper>
        <FileList>
          {mockFiles.map((file, i) => (
            <FileListItem
              key={file.id}
              selected={selectedFile === i}
              onClick={() => onClickFileItem(i)}
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
  gap: theme.spacing.smallest,
  "& > button": {
    flexGrow: 1
  }
}));

export default Plugins;

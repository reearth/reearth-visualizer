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
  const [selectedPluginId, setSelectedPluginId] = useState<string>(
    mockPlugins[0]?.id || ""
  );
  const [selectedFileId, setSelectedFileId] = useState<string>(
    mockFiles[0]?.id || ""
  );

  const onClickPluginItem = (id: string) => {
    setSelectedPluginId(id);
  };

  const onClickFileItem = (id: string) => {
    setSelectedFileId(id);
  };

  return (
    <Wrapper>
      <PluginListWrapper>
        <PluginList>
          {mockPlugins.map((plugin) => (
            <PluginListItem
              key={plugin.id}
              selected={selectedPluginId === plugin.id}
              onClick={() => onClickPluginItem(plugin.id)}
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
          {mockFiles.map((file) => (
            <FileListItem
              key={file.id}
              selected={selectedFileId === file.id}
              onClick={() => onClickFileItem(file.id)}
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
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px  ${theme.spacing.smallest}px ${theme.spacing.normal}px`,
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
  padding: theme.spacing.small,
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
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px  ${theme.spacing.smallest}px ${theme.spacing.normal}px`,
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

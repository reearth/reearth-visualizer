import { Button } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/styled";
import { FC, useState } from "react";

import FileListItem from "./FileListItem";
import usePlugins from "./hook";

type UsePluginsReturn = ReturnType<typeof usePlugins>;

// TODO Implement: display uploaded files
const mockPlugins = [
  {
    id: "1",
    name: "My Plugin"
  }
];

type Props = UsePluginsReturn;

const Plugins: FC<Props> = ({
  files,
  selectFile,
  selectedFile,
  addFile,
  updateFileTitle,
  deleteFile,
  handleFileUpload
}) => {
  const [selectedPlugin, setSelectedPlugin] = useState<number>(0);
  const [isAddingNewFile, setIsAddingNewFile] = useState(false);

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
          <Button
            icon="plus"
            title="File"
            onClick={() => setIsAddingNewFile(true)}
          />
          <Button title="Upload" onClick={handleFileUpload} />
        </ButtonsWrapper>
        <FileList>
          {files.map((file) => (
            <FileListItem
              key={file.id}
              file={file}
              selected={selectedFile.id === file.id}
              confirmFileTitle={updateFileTitle}
              deleteFile={deleteFile}
              onClick={() => selectFile(file)}
            />
          ))}
          {isAddingNewFile && (
            <FileListItem
              file={{ id: "", title: "", sourceCode: "" }}
              selected={false}
              confirmFileTitle={(value) => {
                addFile(value);
                setIsAddingNewFile(false);
              }}
              isEditing
            />
          )}
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

const ButtonsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  gap: theme.spacing.smallest,
  "& > button": {
    flexGrow: 1
  }
}));

export default Plugins;

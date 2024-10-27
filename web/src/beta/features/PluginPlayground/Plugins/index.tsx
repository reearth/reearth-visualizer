import { Button } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/styled";
import { FC, useState } from "react";

import { FileType } from "../hooks";

import FileListItem from "./FileListItem";

// TODO Implement: display uploaded files
const mockPlugins = [
  {
    id: "1",
    name: "My Plugin"
  }
];

type Props = {
  files: FileType[];
  selectedFile: FileType;
  selectFile: (file: FileType) => void;
  addFile: (file: FileType) => void;
  updateFileTitle: (id: string, newTitle: string) => void;
  deleteFile: (id: string) => void;
  handleFileUpload: () => void;
};

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
            onClick={() => {
              const newFile = {
                // gerate unique id
                id:
                  Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15),
                title: "",
                sourceCode: ""
              };
              addFile(newFile);
              selectFile(newFile);
            }}
          />
          <Button title="Upload" onClick={handleFileUpload} />
        </ButtonsWrapper>
        <FileList>
          {files.map((file) => (
            <FileListItem
              key={file.id}
              file={file}
              selected={selectedFile.id === file.id}
              updateFileTitle={updateFileTitle}
              deleteFile={deleteFile}
              onClick={() => selectFile(file)}
            />
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

const ButtonsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest
}));

export default Plugins;

import { Button } from "@reearth/beta/lib/reearth-ui";
import { EntryItem } from "@reearth/beta/ui/components";
import { styled } from "@reearth/services/styled";
import { FC, useState } from "react";

import FileListItem from "./FileListItem";
import usePlugins from "./usePlugins";

type UsePluginsReturn = Pick<
  ReturnType<typeof usePlugins>,
  | "presetPlugins"
  | "selectPlugin"
  | "selectedPlugin"
  | "selectFile"
  | "selectedFile"
  | "addFile"
  | "updateFileTitle"
  | "deleteFile"
  | "handleFileUpload"
>;

type Props = UsePluginsReturn;

const Plugins: FC<Props> = ({
  presetPlugins,
  selectedPlugin,
  selectPlugin,
  selectFile,
  selectedFile,
  addFile,
  updateFileTitle,
  deleteFile,
  handleFileUpload
}) => {
  const [isAddingNewFile, setIsAddingNewFile] = useState(false);

  return (
    <Wrapper>
      <PluginList>
        {presetPlugins.map((category) => (
          <div>
            <CategoryTitle>{category.title}</CategoryTitle>
            {category.plugins.map((plugin) => (
              <EntryItem
                key={plugin.id}
                highlighted={selectedPlugin.id === plugin.id}
                onClick={() => selectPlugin(plugin.id)}
                title={plugin.title}
              />
            ))}
          </div>
        ))}
      </PluginList>
      <FileListWrapper>
        <ButtonsWrapper>
          <Button
            icon="plus"
            title="File"
            extendWidth
            onClick={() => setIsAddingNewFile(true)}
          />
          <Button
            icon="uploadSimple"
            title="Upload"
            extendWidth
            onClick={handleFileUpload}
          />
        </ButtonsWrapper>
        <FileList>
          {selectedPlugin.files.map((file) => (
            <FileListItem
              key={file.id}
              file={file}
              selected={selectedFile.id === file.id}
              confirmFileTitle={updateFileTitle}
              deleteFile={deleteFile}
              onClick={() => selectFile(file.id)}
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

const PluginList = styled("div")(({ theme }) => ({
  width: "50%",
  paddingRight: theme.spacing.small,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

const CategoryTitle = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.smallest}px 0`,
  fontSize: theme.fonts.sizes.body
}));

const FileListWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  paddingLeft: theme.spacing.small,
  width: "50%",
  borderLeft: `1px solid ${theme.outline.weaker}`,
  gap: theme.spacing.small
}));

const FileList = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest
}));

const ButtonsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  gap: theme.spacing.smallest
}));

export default Plugins;

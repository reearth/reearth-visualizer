import { Button, Icon } from "@reearth/beta/lib/reearth-ui";
import { EntryItem } from "@reearth/beta/ui/components";
import { styled } from "@reearth/services/styled";
import { FC, useState } from "react";

import FileListItem from "./FileListItem";
import usePlugins from "./usePlugins";

type UsePluginsReturn = Pick<
  ReturnType<typeof usePlugins>,
  | "encodeAndSharePlugin"
  | "presetPlugins"
  | "selectPlugin"
  | "selectedPlugin"
  | "selectFile"
  | "selectedFile"
  | "addFile"
  | "updateFileTitle"
  | "deleteFile"
  | "handleFileUpload"
  | "sharedPlugin"
>;

type Props = UsePluginsReturn;

const Plugins: FC<Props> = ({
  encodeAndSharePlugin,
  presetPlugins,
  selectedPlugin,
  selectPlugin,
  selectFile,
  selectedFile,
  addFile,
  updateFileTitle,
  deleteFile,
  handleFileUpload,
  sharedPlugin
}) => {
  const [isAddingNewFile, setIsAddingNewFile] = useState(false);

  const handleShareIconClicked = (pluginId: string): void => {
    encodeAndSharePlugin(pluginId);
  };

  return (
    <Wrapper>
      <IconList>
        <Icon icon="addFile" size={32} />
        <Icon icon="import" size={32} />
        <Icon icon="export" size={32} />
        <HorizontalSpacing />
        <Icon icon="paperPlaneTilt" size={"normal"} />
      </IconList>
      <PluginListWrapper>
        <PluginList>
          {presetPlugins.map((category) => (
            <div>
              {category.title !== "Custom" && (
                <CategoryTitle key={category.id}>
                  {category.title}
                </CategoryTitle>
              )}
              {category.plugins.map((plugin) => (
                <EntryItem
                  key={plugin.id}
                  highlighted={selectedPlugin.id === plugin.id}
                  onClick={() => selectPlugin(plugin.id)}
                  title={plugin.title}
                  optionsMenu={[
                    {
                      id: "0",
                      title: "share",
                      icon: "paperPlaneTilt",
                      onClick: () => handleShareIconClicked(plugin.id)
                    }
                  ]}
                  optionsMenuWidth={100}
                />
              ))}
            </div>
          ))}
          <div>
            <CategoryTitle>Shared</CategoryTitle>
            {sharedPlugin && (
              <EntryItem
                key={sharedPlugin.id}
                highlighted={selectedPlugin.id === sharedPlugin.id}
                onClick={() => selectPlugin(sharedPlugin.id)}
                title={sharedPlugin.title}
                optionsMenu={[
                  {
                    id: "0",
                    title: "share",
                    icon: "paperPlaneTilt",
                    onClick: () => handleShareIconClicked(sharedPlugin.id)
                  }
                ]}
                optionsMenuWidth={100}
              />
            )}
          </div>
        </PluginList>
        <FileListWrapper>
          <ButtonsWrapper>
            <Button
              icon="plus"
              extendWidth
              onClick={() => setIsAddingNewFile(true)}
            />
            <Button
              icon="uploadSimple"
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
      </PluginListWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  height: "100%"
}));

const PluginList = styled("div")(({ theme }) => ({
  width: "50%",
  paddingRight: theme.spacing.small,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

const PluginListWrapper = styled("div")(() => ({
  display: "flex",
  height: "100%"
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

const IconList = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small
}));

const HorizontalSpacing = styled("div")(({ theme }) => ({
  width: theme.spacing.micro
}));

export default Plugins;

import { Collapse, IconButton } from "@reearth/beta/lib/reearth-ui";
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
  | "handlePluginDownload"
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
  sharedPlugin,
  handlePluginDownload
}) => {
  const [isAddingNewFile, setIsAddingNewFile] = useState(false);

  const handleShareIconClicked = (): void => {
    encodeAndSharePlugin(selectedPlugin.id);
  };

  const customPlugin = presetPlugins.find((plugin) => plugin.id === "custom");
  const pluginsWithoutCustom = presetPlugins.filter(
    (plugin) => plugin.id !== "custom"
  );

  const PluginEntryItem: FC<{
    plugin: { id: string; title: string };
    selectedPluginId: string;
    onSelect: (id: string) => void;
  }> = ({ plugin, selectedPluginId, onSelect }) => (
    <EntryItem
      key={plugin.id}
      highlighted={selectedPluginId === plugin.id}
      onClick={() => onSelect(plugin.id)}
      title={plugin.title}
      optionsMenuWidth={100}
    />
  );

  return (
    <Wrapper>
      <IconList>
        <IconButton
          appearance="simple"
          icon="addFile"
          onClick={() => setIsAddingNewFile(true)}
        />
        <IconButton
          appearance="simple"
          icon="import"
          onClick={handleFileUpload}
        />
        <IconButton
          appearance="simple"
          icon="export"
          onClick={handlePluginDownload}
        />
        <IconButton
          appearance="simple"
          icon="paperPlaneTilt"
          onClick={handleShareIconClicked}
        />
      </IconList>
      <PluginListWrapper>
        <PluginList>
          {customPlugin && (
            <div>
              {customPlugin.plugins.map((plugin) => (
                <PluginEntryItem
                  plugin={plugin}
                  key={plugin.id}
                  selectedPluginId={selectedPlugin.id}
                  onSelect={selectPlugin}
                />
              ))}
            </div>
          )}
          {pluginsWithoutCustom.map((category) => (
            <PresetPluginWrapper key={category.id}>
              <Collapse
                collapsed
                iconPosition="left"
                size="small"
                title={category.title}
              >
                {category.plugins.map((plugin) => (
                  <PluginEntryItem
                    plugin={plugin}
                    key={plugin.id}
                    selectedPluginId={selectedPlugin.id}
                    onSelect={selectPlugin}
                  />
                ))}
              </Collapse>
            </PresetPluginWrapper>
          ))}
          <div>
            <CategoryTitle>Shared</CategoryTitle>
            {sharedPlugin && (
              <PluginEntryItem
                plugin={sharedPlugin}
                key={sharedPlugin.id}
                selectedPluginId={selectedPlugin.id}
                onSelect={selectPlugin}
              />
            )}
          </div>
        </PluginList>
        <FileListWrapper>
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

const IconList = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
  marginBottom: theme.spacing.small
}));

const PresetPluginWrapper = styled("div")(({ theme }) => ({
  marginLeft: -theme.spacing.normal
}));

export default Plugins;

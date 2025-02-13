import { Collapse, IconButton, Typography } from "@reearth/beta/lib/reearth-ui";
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
  | "handlePluginImport"
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
  handlePluginImport,
  sharedPlugin,
  handlePluginDownload
}) => {
  const [isAddingNewFile, setIsAddingNewFile] = useState(false);

  const handlePluginShare = (): void => {
    if (!selectedPlugin) return;
    encodeAndSharePlugin(selectedPlugin.id);
  };

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
          onClick={handlePluginImport}
        />
        <IconButton
          appearance="simple"
          icon="export"
          onClick={handlePluginDownload}
        />
        <IconButton
          appearance="simple"
          icon="paperPlaneTilt"
          onClick={handlePluginShare}
        />
      </IconList>
      <PluginListWrapper>
        <PluginList>
          {sharedPlugin && (
            <div>
              <Collapse
                key={"shared"}
                iconPosition="left"
                size="small"
                title={"Shared"}
                noPadding
              >
                <PluginSubList>
                  <PluginEntryItem
                    plugin={sharedPlugin}
                    key={sharedPlugin.id}
                    selectedPluginId={selectedPlugin.id}
                    onSelect={selectPlugin}
                  />
                </PluginSubList>
              </Collapse>
            </div>
          )}
          {presetPlugins.map((category) => (
            <div key={category.id}>
              <Collapse
                key={category.id}
                collapsed={category.id !== "custom"}
                iconPosition="left"
                size="small"
                title={category.title}
                noPadding
              >
                <PluginSubList>
                  {category.plugins.length > 0 ? (
                    category.plugins.map((plugin) => (
                      <PluginEntryItem
                        plugin={plugin}
                        key={plugin.id}
                        selectedPluginId={selectedPlugin.id}
                        onSelect={selectPlugin}
                      />
                    ))
                  ) : (
                    <EmptyTip>
                      <Typography size="body" color="weak" trait="italic">
                        No plugins
                      </Typography>
                    </EmptyTip>
                  )}
                </PluginSubList>
              </Collapse>
            </div>
          ))}
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
  height: "100%",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1
}));

const PluginList = styled("div")(({ theme }) => ({
  width: "50%",
  paddingRight: theme.spacing.small,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest
}));

const PluginListWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  marginLeft: -theme.spacing.smallest
}));

const PluginSubList = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  paddingLeft: 24,
  paddingTop: theme.spacing.smallest
}));

const EmptyTip = styled("div")(({ theme }) => ({
  padding: theme.spacing.smallest,
  paddingLeft: theme.spacing.small
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

export default Plugins;

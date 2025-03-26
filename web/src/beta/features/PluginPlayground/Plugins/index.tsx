import { Collapse, Typography, IconButton } from "@reearth/beta/lib/reearth-ui";
import { EntryItem } from "@reearth/beta/ui/components";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useState, useEffect } from "react";

import { SHARED_PLUGIN_ID } from "./constants";
import FileListItem from "./FileListItem";
import useTitles from "./presets/useTitles";
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
  const t = useT();
  const [isAddingNewFile, setIsAddingNewFile] = useState(false);
  const [collapsedCatergoryIds, setCollapsedCategoryIds] = useState<string[]>(
    presetPlugins
      .map((category) => category.id)
      .filter((id) => {
        return id !== "custom";
      })
  );

  const handlePluginShare = (): void => {
    if (!selectedPlugin) return;
    encodeAndSharePlugin(selectedPlugin.id);
  };

  const { categoryTitles, pluginTitles } = useTitles();

  useEffect(() => {
    if (!selectedPlugin) return;
    const selectedCategory = presetPlugins.find((category) =>
      category.plugins.find((plugin) => plugin.id === selectedPlugin.id)
    );
    if (selectedCategory) {
      setCollapsedCategoryIds((prev) =>
        prev.filter((id) => id !== selectedCategory.id)
      );
    }
  }, [presetPlugins, selectedPlugin]);

  const PluginEntryItem: FC<{
    highlighted: boolean;
    onSelect: (id: string) => void;
    pluginId: string;
    title: string;
  }> = ({ highlighted, pluginId, onSelect, title }) => {
    return (
      <EntryItem
        key={pluginId}
        highlighted={highlighted}
        onClick={() => onSelect(pluginId)}
        title={title}
        optionsMenuWidth={100}
      />
    );
  };

  return (
    <Wrapper>
      <Actions>
        <IconButton
          icon="addFile"
          tooltipText={t("Add File")}
          placement="top"
          size="large"
          hasBorder
          onClick={() => setIsAddingNewFile(true)}
        />
        <IconButton
          icon="import"
          tooltipText={t("Import Plugin")}
          placement="top"
          size="large"
          hasBorder
          onClick={handlePluginImport}
        />
        <IconButton
          icon="export"
          tooltipText={t("Export Plugin")}
          placement="top"
          size="large"
          hasBorder
          onClick={handlePluginDownload}
        />
        <IconButton
          icon="paperPlaneTilt"
          tooltipText={t("Share Plugin")}
          placement="top"
          size="large"
          hasBorder
          onClick={handlePluginShare}
        />
      </Actions>
      <PluginBrowser>
        <PluginList>
          {sharedPlugin && sharedPlugin.id === SHARED_PLUGIN_ID && (
            <div>
              <Collapse
                key={"shared"}
                iconPosition="left"
                size="small"
                title={t("Shared")}
                noPadding
              >
                <PluginSubList>
                  <PluginEntryItem
                    highlighted={selectedPlugin.id === sharedPlugin.id}
                    key={sharedPlugin.id}
                    onSelect={selectPlugin}
                    pluginId={sharedPlugin.id}
                    title={pluginTitles[sharedPlugin.id]}
                  />
                </PluginSubList>
              </Collapse>
            </div>
          )}
          {presetPlugins.map((category) => (
            <div key={category.id}>
              <Collapse
                key={category.id}
                collapsed={collapsedCatergoryIds.includes(category.id)}
                iconPosition="left"
                size="small"
                title={categoryTitles[category.id]}
                noPadding
              >
                <PluginSubList>
                  {category.plugins.length > 0 ? (
                    category.plugins.map((plugin) => {
                      return (
                        <PluginEntryItem
                          highlighted={selectedPlugin.id === plugin.id}
                          key={plugin.id}
                          onSelect={selectPlugin}
                          pluginId={plugin.id}
                          title={pluginTitles[plugin.id]}
                        />
                      );
                    })
                  ) : (
                    <EmptyTip>
                      <Typography size="body" color="weak" trait="italic">
                        {t("No plugins")}
                      </Typography>
                    </EmptyTip>
                  )}
                </PluginSubList>
              </Collapse>
            </div>
          ))}
        </PluginList>
        <FileList>
          <FileSubList>
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
          </FileSubList>
        </FileList>
      </PluginBrowser>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  gap: theme.spacing.small,
  minHeight: 0
}));

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
  flexShrink: 0
}));

const PluginBrowser = styled("div")(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  marginLeft: -theme.spacing.smallest,
  minHeight: 0
}));

const PluginList = styled("div")(({ theme }) => ({
  width: "50%",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  paddingRight: theme.spacing.small,
  overflowY: "auto",
  overflowX: "hidden",
  minHeight: 0
}));

const FileList = styled("div")(({ theme }) => ({
  width: "50%",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  paddingLeft: theme.spacing.small,
  borderLeft: `1px solid ${theme.outline.weaker}`,
  overflowY: "auto",
  overflowX: "hidden",
  minHeight: 0
}));

const PluginSubList = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  paddingLeft: 24,
  paddingTop: theme.spacing.smallest
}));

const FileSubList = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest
}));

const EmptyTip = styled("div")(({ theme }) => ({
  padding: theme.spacing.smallest,
  paddingLeft: theme.spacing.small
}));

export default Plugins;

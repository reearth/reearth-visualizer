import { Collapse, Typography, Button } from "@reearth/beta/lib/reearth-ui";
import { EntryItem } from "@reearth/beta/ui/components";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/styled";
import { FC, useMemo, useState } from "react";

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
  const t = useT();
  const [isAddingNewFile, setIsAddingNewFile] = useState(false);

  const handlePluginShare = (): void => {
    if (!selectedPlugin) return;
    encodeAndSharePlugin(selectedPlugin.id);
  };

  const categoryTitles: Record<string, string> = useMemo(() => {
    return {
      custom: t("Custom"),
      ui: t("User Interface"),
      communication: t("Communication"),
      viewerScene: t("Viewer & Scene Settings"),
      layers: t("Manage Layer"),
      layerStyles: t("Manage Layer Style"),
      camera: t("Camera"),
      timeline: t("Timeline"),
      dataStorage: t("Data Storage"),
      extension: t("Extension")
    };
  }, [t]);

  const pluginTitles: Record<string, string> = useMemo(() => {
    return {
      "my-plugin": t("My Plugin"),
      "responsive-panel": t("Responsive Panel"),
      sidebar: t("Sidebar"),
      header: t("Header"),
      "popup-plugin": t("Popup"),
      "modal-window": t("Modal Window"),
      "ui-extension-messenger": t("UI Extension Messenger"),
      "extension-to-extension-messenger": t("Extension To Extension Messenger"),
      "enable-shadow-style": t("Enable Shadow Style"),
      "enable-terrain": t("Enable Terrain"),
      "show-label": t("Show Label"),
      "take-screenshot": t("Take Screenshot"),
      "mouse-events": t("Mouse Events"),
      "add-geojson": t("Add Geojson"),
      "add-csv": t("Add CSV"),
      "add-kml": t("Add KML"),
      "add-wms": t("Add WMS"),
      "add-czml": t("Add CZML"),
      "add-3d-tiles": t("Add 3D Tiles"),
      "add-google-photorealistic-3d-tiles": t(
        "Add Google Photorealistic 3D Tiles"
      ),
      "add-osm-3d-tiles": t("Add OSM 3D Tiles"),
      "hide-fly-to-delete-layer": t("Hide Fly To Delete Layer"),
      "override-layer-data": t("Override Layer Data"),
      "show-selected-features-info": t("Show Selected Features Information"),
      "layer-styling-examples": t("Layer Styling Examples"),
      "feature-style-3d-model": t("Feature Style 3D Model"),
      "feature-style-3d-tiles": t("Feature Style 3D Tiles"),
      "filter-features-with-style": t("Filter Features by Style"),
      "override-style": t("Override Style"),
      "style-with-condition": t("Style With Condition"),
      "playback-control": t("Playback Control"),
      "time-driven-features": t("Time Driven Features"),
      "time-driven-path": t("Time Driven Path"),
      "theme-selector": t("Theme Selector"),
      "extension-property": t("Extension Property"),
      "zoom-in-out": t("Zoom In Out"),
      "camera-rotation": t("Camera Rotation"),
      "camera-position": t("Camera Position")
    };
  }, [t]);

  const PluginEntryItem: FC<{
    pluginId: string;
    selectedPluginId: string;
    title: string;
    onSelect: (id: string) => void;
  }> = ({ pluginId, selectedPluginId, onSelect, title }) => {
    return (
      <EntryItem
        key={pluginId}
        highlighted={selectedPluginId === pluginId}
        onClick={() => onSelect(pluginId)}
        title={title}
        optionsMenuWidth={100}
      />
    );
  };

  return (
    <Wrapper>
      <Actions>
        <Button
          icon="addFile"
          iconButton
          tooltipText={t("Add File")}
          placement="top"
          onClick={() => setIsAddingNewFile(true)}
        />
        <Button
          icon="import"
          iconButton
          tooltipText={t("Import Plugin")}
          placement="top"
          onClick={handlePluginImport}
        />
        <Button
          icon="export"
          iconButton
          tooltipText={t("Export Plugin")}
          placement="top"
          onClick={handlePluginDownload}
        />
        <Button
          icon="paperPlaneTilt"
          iconButton
          tooltipText={t("Share Plugin")}
          placement="top"
          onClick={handlePluginShare}
        />
      </Actions>
      <PluginBrowser>
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
                    pluginId={sharedPlugin.id}
                    key={sharedPlugin.id}
                    title={pluginTitles[sharedPlugin.id]}
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
                title={categoryTitles[category.id]}
                noPadding
              >
                <PluginSubList>
                  {category.plugins.length > 0 ? (
                    category.plugins.map((plugin) => (
                      <PluginEntryItem
                        pluginId={plugin.id}
                        key={plugin.id}
                        title={pluginTitles[plugin.id]}
                        selectedPluginId={selectedPlugin.id}
                        onSelect={selectPlugin}
                      />
                    ))
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

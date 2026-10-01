import {
  Button,
  PopupMenu,
  PopupMenuItem,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { EntryItem } from "@reearth/app/ui/components";
import { Panel, PanelProps } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useMemo, useState } from "react";

import ExtensionSettings from "../ExtensionSettings";
import { FileType, PluginType } from "../Plugins/constants";
import { FieldValue, ReearthYML } from "../types";

import { DEV_PLUGIN_PARAM } from "./useDevPlugin";

// The right-hand panels, laid out like the editor's Widgets tab: a widget
// manager (add / select / delete), an inspector for the selected extension's
// properties, and the plugin's blocks, which the Widgets tab has no place for.

export type Extension = NonNullable<ReearthYML["extensions"]>[number];

// `reearth visualizer plugin dev` serves the plugin here by default.
const DEFAULT_PLUGIN_URL = "http://localhost:5180/plugin";

const openWithPlugin = (url: string) => {
  const params = new URLSearchParams(window.location.search);
  params.set(DEV_PLUGIN_PARAM, url.trim());
  window.location.search = params.toString();
};

type PanelAreaProps = Pick<PanelProps, "showCollapseArea" | "areaRef">;

/** Shown without ?dev-plugin=: asks for the URL of a plugin server. */
export const PluginUrlPanel: FC<PanelAreaProps> = (areaProps) => {
  const t = useT();
  const [value, setValue] = useState(DEFAULT_PLUGIN_URL);
  return (
    <Panel title={t("Plugin")} alwaysOpen extend {...areaProps}>
      <Column>
        <Typography size="body">
          {t("Enter the URL of a plugin server to load a plugin.")}
        </Typography>
        <TextInput
          value={value}
          placeholder={DEFAULT_PLUGIN_URL}
          onChange={setValue}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) openWithPlugin(value);
          }}
        />
        <Button
          appearance="primary"
          title={t("Load")}
          disabled={!value.trim()}
          onClick={() => openWithPlugin(value)}
        />
        <Typography size="footnote" color="weak">
          {t(
            "The URL must serve reearth.yml and <extension-id>.js. A change event on <url>/events reloads the plugin."
          )}
        </Typography>
        <Typography size="footnote" color="weak">
          {t("To serve a plugin, run this in its directory:")}
        </Typography>
        <Code>reearth visualizer plugin dev</Code>
        <Typography size="footnote" color="weak">
          {t("Or open this page with ?{{param}}=<url>.", {
            param: DEV_PLUGIN_PARAM
          })}
        </Typography>
      </Column>
    </Panel>
  );
};

type WidgetManagerProps = PanelAreaProps & {
  url: string;
  plugin?: PluginType;
  widgets: Extension[];
  installedWidgetIds: string[];
  selectedId?: string;
  errors: string[];
  live: boolean;
  loading: boolean;
  onReload: () => void;
  onWidgetAdd: (id: string) => void;
  onWidgetRemove: (id: string) => void;
  onSelect: (id?: string) => void;
};

export const WidgetManagerPanel: FC<WidgetManagerProps> = ({
  url,
  plugin,
  widgets,
  installedWidgetIds,
  selectedId,
  errors,
  live,
  loading,
  onReload,
  onWidgetAdd,
  onWidgetRemove,
  onSelect,
  ...areaProps
}) => {
  const t = useT();

  const addable: PopupMenuItem[] = useMemo(
    () =>
      widgets
        .filter((w) => !installedWidgetIds.includes(w.id))
        .map((w) => ({
          id: w.id,
          title: w.name ?? w.id,
          icon: "plugin",
          onClick: () => onWidgetAdd(w.id)
        })),
    [widgets, installedWidgetIds, onWidgetAdd]
  );

  return (
    <Panel
      title={t("Widget Manager")}
      alwaysOpen
      extend
      storageId="plugin-playground-dev-widget-manager-panel"
      {...areaProps}
    >
      <Column>
        <Row>
          <Status
            live={live}
            title={live ? t("Watching for changes") : t("Not connected")}
          />
          <Typography size="body" weight="bold">
            {plugin?.id ?? (loading ? t("Loading...") : t("No plugin"))}
          </Typography>
          <Spacer />
          <Button
            size="small"
            icon="arrowCounterClockWise"
            title={t("Reload")}
            onClick={onReload}
          />
        </Row>
        <Typography size="footnote" color="weak">
          {url}
        </Typography>
        {errors.map((err) => (
          <ErrorText key={err}>{err}</ErrorText>
        ))}

        <PopupMenu
          label={
            <Button
              icon="folderSimplePlus"
              title={t("Add Widget")}
              size="small"
              extendWidth
              disabled={!addable.length}
            />
          }
          menu={addable}
          extendTriggerWidth
          extendContentWidth
        />
        <List>
          {widgets
            .filter((w) => installedWidgetIds.includes(w.id))
            .map((w) => (
              <EntryItem
                key={w.id}
                title={<ItemTitle>{w.name ?? w.id}</ItemTitle>}
                highlighted={w.id === selectedId}
                optionsMenu={[
                  {
                    id: "delete",
                    title: t("Delete"),
                    icon: "trash",
                    onClick: () => onWidgetRemove(w.id)
                  }
                ]}
                optionsMenuWidth={100}
                onClick={() => onSelect(w.id)}
              />
            ))}
        </List>
      </Column>
      <EmptySpace onClick={() => onSelect(undefined)} />
    </Panel>
  );
};

type BlocksProps = PanelAreaProps & {
  blocks: Extension[];
  selectedId?: string;
  onSelect: (id?: string) => void;
};

/** Story and infobox blocks: shown in the story panel and the infobox. */
export const BlocksPanel: FC<BlocksProps> = ({
  blocks,
  selectedId,
  onSelect,
  ...areaProps
}) => {
  const t = useT();
  return (
    <Panel
      title={t("Blocks")}
      alwaysOpen
      storageId="plugin-playground-dev-blocks-panel"
      {...areaProps}
    >
      <List>
        {blocks.map((b) => (
          <EntryItem
            key={b.id}
            title={
              <ItemTitle>
                {b.name ?? b.id}
                <BlockType>
                  {b.type === "storyBlock" ? t("Story") : t("Infobox")}
                </BlockType>
              </ItemTitle>
            }
            highlighted={b.id === selectedId}
            onClick={() => onSelect(b.id)}
          />
        ))}
      </List>
    </Panel>
  );
};

type InspectorProps = PanelAreaProps & {
  plugin: PluginType;
  selectedFile: FileType;
  fieldValues: Record<string, FieldValue>;
  setFieldValues: (values: Record<string, FieldValue>) => void;
};

/** The selected extension's properties, from its reearth.yml schema. */
export const InspectorPanel: FC<InspectorProps> = ({
  plugin,
  selectedFile,
  fieldValues,
  setFieldValues,
  ...areaProps
}) => {
  const t = useT();
  return (
    <Panel title={t("Inspector")} extend alwaysOpen {...areaProps}>
      <ExtensionSettings
        selectedPlugin={plugin}
        selectedFile={selectedFile}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
      />
    </Panel>
  );
};

const Column = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small
}));

const Row = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small
}));

const Spacer = styled("div")({ flex: 1 });

const List = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest
}));

const ItemTitle = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

const BlockType = styled("span")(({ theme }) => ({
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.footnote
}));

const EmptySpace = styled("div")({ flex: 1, minHeight: 50 });

const Status = styled("span")<{ live: boolean }>(({ live, theme }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0,
  background: live ? theme.select.main : theme.content.weak
}));

const Code = styled("code")(({ theme }) => ({
  fontFamily: "monospace",
  padding: theme.spacing.small,
  borderRadius: theme.radius.small,
  background: theme.bg[2]
}));

const ErrorText = styled("p")(({ theme }) => ({
  margin: 0,
  color: theme.dangerous.main,
  fontSize: theme.fonts.sizes.footnote,
  wordBreak: "break-word"
}));

import { IconButton, Typography } from "@reearth/app/lib/reearth-ui";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { EntryItem, EntryItemAction } from "@reearth/app/ui/components";
import { Panel } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, KeyboardEvent, useMemo } from "react";

import ExtensionSettings from "./ExtensionSettings";
import type { FieldValue, FieldValues, PluginExtension } from "./types";

type Extension = PluginExtension;

const TYPES = ["widget", "storyBlock", "infoboxBlock"] as const;
type ExtensionType = (typeof TYPES)[number];

const useTypeLabels = () => {
  const t = useT();
  return useMemo(
    () => ({
      widget: {
        many: t("Widgets"),
        one: t("Widget"),
        hide: t("Hide on map"),
        show: t("Show on map"),
        hidden: t("Hidden on the map.")
      },
      storyBlock: {
        many: t("Story blocks"),
        one: t("Story block"),
        hide: t("Hide from story panel"),
        show: t("Show in story panel"),
        hidden: t("Hidden from the story panel.")
      },
      infoboxBlock: {
        many: t("Infobox blocks"),
        one: t("Infobox block"),
        hide: t("Hide from infobox"),
        show: t("Show in infobox"),
        hidden: t("Hidden from the infobox.")
      }
    }),
    [t]
  );
};

// Long lists scroll, so that every panel's header stays in view.
const LIST_MAX_HEIGHT: Record<ExtensionType, string> = {
  widget: "32vh",
  storyBlock: "18vh",
  infoboxBlock: "18vh"
};

type ListProps = {
  extensions: Extension[];
  selectedId?: string;
  hiddenIds: string[];
  extensionErrors: Record<string, string>;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
};

/**
 * The plugin's extensions (reearth.yml calls widgets and blocks that), in a
 * collapsible panel per type. Every row works the same way: click it to
 * inspect it; its eye takes it
 * off the map, out of the story panel or out of the infobox.
 */
export const ExtensionPanels: FC<ListProps> = ({ extensions, ...rowProps }) => {
  const t = useT();
  const labels = useTypeLabels();
  const groups = TYPES.map((type) => ({
    type,
    items: extensions.filter((e) => e.type === type)
  })).filter((g) => g.items.length);

  if (!groups.length) {
    return (
      <Panel title={t("Widgets and blocks")} alwaysOpen>
        <Empty>
          <Typography size="body" color="weak">
            {t("reearth.yml has no widgets or blocks yet.")}
          </Typography>
        </Empty>
      </Panel>
    );
  }

  return (
    <>
      {groups.map((g) => (
        <Panel
          key={g.type}
          title={labels[g.type].many}
          storageId={`workbench-${g.type}-panel`}
        >
          <List maxHeight={LIST_MAX_HEIGHT[g.type]}>
            {g.items.map((ext) => (
              <ExtensionRow key={ext.id} extension={ext} {...rowProps} />
            ))}
          </List>
        </Panel>
      ))}
    </>
  );
};

const ExtensionRow: FC<
  Omit<ListProps, "extensions"> & { extension: Extension }
> = ({
  extension: ext,
  selectedId,
  hiddenIds,
  extensionErrors,
  onSelect,
  onToggleHidden
}) => {
  const theme = useTheme();
  const labels = useTypeLabels();
  const kind = labels[ext.type as ExtensionType] ?? labels.widget;
  const hidden = hiddenIds.includes(ext.id);
  const problem = extensionErrors[ext.id];
  const eyeLabel = hidden ? kind.show : kind.hide;

  const actions: EntryItemAction[] = [
    ...(problem
      ? [
          {
            comp: (
              <Tooltip
                key="problem"
                type="custom"
                icon="warning"
                iconColor={theme.warning.main}
                text={problem}
                placement="left"
              />
            ),
            keepVisible: true
          }
        ]
      : []),
    {
      comp: (
        <IconButton
          key="visible"
          icon={hidden ? "eyeSlash" : "eye"}
          size="small"
          appearance="simple"
          placement="left"
          tooltipText={eyeLabel}
          ariaLabel={eyeLabel}
          stopPropagationOnClick
          onClick={() => onToggleHidden(ext.id)}
        />
      ),
      keepVisible: true
    }
  ];

  const select = () => onSelect(ext.id);
  return (
    <Row
      role="button"
      tabIndex={0}
      aria-pressed={ext.id === selectedId}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      }}
    >
      <EntryItem
        title={<ItemTitle dimmed={hidden}>{ext.name ?? ext.id}</ItemTitle>}
        highlighted={ext.id === selectedId}
        actions={actions}
        onClick={select}
      />
    </Row>
  );
};

type InspectorProps = {
  pluginId?: string;
  extension?: Extension;
  fieldValues: FieldValues;
  hasStoredValues: boolean;
  hidden: boolean;
  infoboxOpen: boolean;
  onFieldChange: (key: string, value: FieldValue) => void;
  setFieldValues: (update: (prev: FieldValues) => FieldValues) => void;
  onReset: () => void;
  onShow: () => void;
  onOpenInfobox: () => void;
};

/** The selected extension: what it is, where it shows, and its properties. */
export const InspectorPanel: FC<InspectorProps> = ({
  pluginId,
  extension,
  fieldValues,
  hasStoredValues,
  hidden,
  infoboxOpen,
  onFieldChange,
  setFieldValues,
  onReset,
  onShow,
  onOpenInfobox
}) => {
  const t = useT();
  const labels = useTypeLabels();
  const kind =
    extension && extension.type in labels
      ? labels[extension.type as ExtensionType]
      : undefined;

  return (
    <Panel title={t("Inspector")} alwaysOpen extend>
      {!pluginId || !extension ? (
        <Empty>
          <Typography size="body" color="weak">
            {t("Select a widget or block to see its properties.")}
          </Typography>
        </Empty>
      ) : (
        <Body>
          <Header>
            <HeaderText>
              <Typography size="body" weight="bold">
                {extension.name ?? extension.id}
              </Typography>
              <Meta>
                <Typography size="footnote" color="weak">
                  {kind?.one ?? extension.type}
                </Typography>
                <Id>{extension.id}</Id>
              </Meta>
            </HeaderText>
            {hasStoredValues && (
              <IconButton
                icon="arrowCounterClockWise"
                appearance="simple"
                placement="left"
                tooltipText={t("Reset to defaults")}
                ariaLabel={t("Reset to defaults")}
                onClick={onReset}
              />
            )}
          </Header>
          {hidden && kind && (
            <Hint>
              <Typography size="footnote" color="weak">
                {kind.hidden}
              </Typography>
              <LinkButton onClick={onShow}>{t("Show")}</LinkButton>
            </Hint>
          )}
          {!hidden && extension.type === "storyBlock" && (
            <Hint>
              <Typography size="footnote" color="weak">
                {t("Shows in the story panel.")}
              </Typography>
            </Hint>
          )}
          {!hidden && extension.type === "infoboxBlock" && (
            <Hint>
              <Typography size="footnote" color="weak">
                {infoboxOpen
                  ? t("Shows in the infobox.")
                  : t(
                      "Shows in the infobox, which opens when you click a feature on the map."
                    )}
              </Typography>
              {!infoboxOpen && (
                <LinkButton onClick={onOpenInfobox}>
                  {t("Open infobox")}
                </LinkButton>
              )}
            </Hint>
          )}
          {extension.schema?.groups?.length ? (
            <ExtensionSettings
              pluginId={pluginId}
              extension={extension}
              values={fieldValues}
              onFieldChange={onFieldChange}
              setValues={setFieldValues}
            />
          ) : (
            <Hint>
              <Typography size="footnote" color="weak">
                {t(
                  "No properties. Add a schema to this extension in reearth.yml to edit them here."
                )}
              </Typography>
            </Hint>
          )}
        </Body>
      )}
    </Panel>
  );
};

const List = styled("div", {
  shouldForwardProp: (prop) => prop !== "maxHeight"
})<{ maxHeight: string }>(({ theme, maxHeight }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.micro,
  maxHeight,
  overflowY: "auto"
}));

const Row = styled("div")(({ theme }) => ({
  display: css.display.flex,
  borderRadius: theme.radius.small,
  outline: "none",
  ["&:focus-visible"]: {
    boxShadow: `0 0 0 1px ${theme.select.main}`
  }
}));

const ItemTitle = styled("div", {
  shouldForwardProp: (prop) => prop !== "dimmed"
})<{ dimmed?: boolean }>(({ theme, dimmed }) => ({
  flex: 1,
  minWidth: 0,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis,
  whiteSpace: css.whiteSpace.nowrap,
  color: dimmed ? theme.content.weak : theme.content.main,
  fontSize: theme.fonts.sizes.body
}));

const Empty = styled("div")(({ theme }) => ({
  padding: theme.spacing.small
}));

const Body = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small
}));

const Header = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.small,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px 0`
}));

const HeaderText = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.micro,
  flex: 1,
  minWidth: 0
}));

const Meta = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.baseline,
  gap: theme.spacing.small
}));

const Id = styled("code")(({ theme }) => ({
  fontFamily: theme.fonts.fontFamilies.code,
  fontSize: theme.fonts.sizes.footnote,
  color: theme.content.weak
}));

const Hint = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexWrap: "wrap",
  alignItems: css.alignItems.baseline,
  gap: `0 ${theme.spacing.small}px`,
  padding: `0 ${theme.spacing.small}px`
}));

const LinkButton = styled("button")(({ theme }) => ({
  padding: 0,
  border: "none",
  background: "transparent",
  color: theme.primary.main,
  fontSize: theme.fonts.sizes.footnote,
  cursor: css.cursor.pointer,
  ["&:hover"]: {
    textDecoration: "underline"
  }
}));

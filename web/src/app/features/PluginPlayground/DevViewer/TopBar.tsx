import {
  Button,
  IconButton,
  Popup,
  Typography
} from "@reearth/app/lib/reearth-ui";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { SelectField } from "@reearth/app/ui/fields";
import { Panel } from "@reearth/app/ui/layout";
import { SUPPORTED_LANGUAGES } from "@reearth/services/i18n";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";

import { PluginUrlForm } from "./MapStates";
import { DevPluginError } from "./useDevPlugin";

type Props = {
  url?: string;
  name?: string;
  version?: string;
  loaded: boolean;
  live: boolean;
  loading: boolean;
  loadedAt?: Date;
  error?: DevPluginError;
  layers: ReactNode;
  settings: ReactNode;
  sidebarOpen: boolean;
  onReload: () => void;
  onSidebarToggle: () => void;
};

/**
 * The plugin and whether its latest code is running, on the left; Reload and
 * the map's layers and settings, on the right.
 */
const TopBar: FC<Props> = ({
  url,
  name,
  version,
  loaded,
  live,
  loading,
  loadedAt,
  error,
  layers,
  settings,
  sidebarOpen,
  onReload,
  onSidebarToggle
}) => {
  const t = useT();
  const theme = useTheme();

  if (!url) {
    return (
      <Panel extend>
        <Bar>
          <Typography size="body" weight="bold">
            {t("Visualizer workbench")}
          </Typography>
        </Bar>
      </Panel>
    );
  }

  const status =
    error?.kind === "unreachable"
      ? {
          label: t("Offline"),
          color: theme.dangerous.main,
          tip: t("Can't reach the plugin server.")
        }
      : live
        ? {
            label: t("Live"),
            color: theme.success.main,
            tip: t("Reloads when you save a file.")
          }
        : loading && !loaded
          ? {
              label: t("Connecting…"),
              color: theme.content.weak,
              tip: undefined
            }
          : {
              label: t("Not watching"),
              color: theme.content.weak,
              tip: t(
                "This server doesn't send change events. Use Reload after you save."
              )
            };

  const statusChip = (
    <Status>
      <Dot style={{ background: status.color }} />
      <Typography size="footnote">{status.label}</Typography>
    </Status>
  );

  return (
    <Panel extend>
      <Bar>
        {status.tip ? (
          <Tooltip
            type="custom"
            text={status.tip}
            placement="bottom-start"
            triggerComponent={statusChip}
          />
        ) : (
          statusChip
        )}
        <Name>
          {name && (
            <Typography size="body" weight="bold">
              {name}
            </Typography>
          )}
          {version && (
            <Typography size="footnote" color="weak">
              {version}
            </Typography>
          )}
          <Popup
            placement="bottom-start"
            offset={4}
            trigger={
              <UrlButton title={t("Change plugin URL")}>{url}</UrlButton>
            }
          >
            <PopoverPanel>
              <Typography size="body" weight="bold">
                {t("Plugin URL")}
              </Typography>
              <PluginUrlForm initialUrl={url} />
            </PopoverPanel>
          </Popup>
        </Name>
        <Reload>
          <Button
            size="small"
            icon="arrowCounterClockWise"
            title={t("Reload")}
            onClick={onReload}
          />
          <Typography size="footnote" color="weak">
            {loading
              ? t("Loading…")
              : loadedAt
                ? t("Reloaded {{time}}", {
                    time: loadedAt.toLocaleTimeString([], { hour12: false })
                  })
                : ""}
          </Typography>
        </Reload>
        <Spacer />
        <Popup
          placement="bottom-end"
          offset={4}
          trigger={<Button size="small" icon="layers" title={t("Layers")} />}
        >
          <PopoverPanel noPadding>
            <PopoverTitle>
              <Typography size="body" weight="bold">
                {t("Layers")}
              </Typography>
            </PopoverTitle>
            {layers}
          </PopoverPanel>
        </Popup>
        <Popup
          placement="bottom-end"
          offset={4}
          trigger={<Button size="small" icon="setting" title={t("Settings")} />}
        >
          <PopoverPanel noPadding>
            <PopoverTitle>
              <Typography size="body" weight="bold">
                {t("Settings")}
              </Typography>
            </PopoverTitle>
            {settings}
          </PopoverPanel>
        </Popup>
        {loaded && (
          <>
            <Separator />
            <SidebarToggle
              icon="sidebar"
              size="medium"
              hasBorder
              placement="bottom-end"
              tooltipText={sidebarOpen ? t("Hide sidebar") : t("Show sidebar")}
              ariaLabel={sidebarOpen ? t("Hide sidebar") : t("Show sidebar")}
              onClick={onSidebarToggle}
            />
          </>
        )}
      </Bar>
    </Panel>
  );
};

export default TopBar;

/** The settings popover: the language of the workbench and of Visualizer. */
export const LanguageSetting: FC<{
  lang: string;
  onChange: (lang: string) => void;
}> = ({ lang, onChange }) => {
  const t = useT();
  return (
    <SettingRow>
      <SelectField
        title={t("UI Language")}
        value={lang}
        options={Object.values(SUPPORTED_LANGUAGES)}
        onChange={(value) => onChange(value as string)}
      />
    </SettingRow>
  );
};

const SettingRow = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.smallest}px ${theme.spacing.normal}px ${theme.spacing.small}px`
}));

const Bar = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  width: "100%",
  minWidth: 0,
  padding: `0 ${theme.spacing.normal}px`
}));

const Status = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest + theme.spacing.micro,
  flexShrink: 0,
  padding: `${theme.spacing.micro}px ${theme.spacing.small}px`,
  borderRadius: theme.radius.small,
  background: theme.bg[1]
}));

const Dot = styled("span")({
  width: 6,
  height: 6,
  borderRadius: "50%",
  flexShrink: 0
});

const Name = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  minWidth: 0,
  marginLeft: theme.spacing.smallest,
  whiteSpace: "nowrap"
}));

const UrlButton = styled("button")(({ theme }) => ({
  display: css.display.block,
  minWidth: 0,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis,
  padding: `0 ${theme.spacing.smallest}px`,
  border: "none",
  borderRadius: theme.radius.small,
  background: "transparent",
  color: theme.content.weak,
  fontFamily: theme.fonts.fontFamilies.code,
  fontSize: theme.fonts.sizes.footnote,
  lineHeight: "16px",
  cursor: css.cursor.pointer,
  ["&:hover"]: {
    color: theme.content.main,
    background: theme.bg[1]
  }
}));

const Reload = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  flexShrink: 0,
  marginLeft: theme.spacing.small
}));

const Spacer = styled("div")({ flex: 1 });

// Sets the sidebar toggle apart from the map's buttons.
const Separator = styled("div")(({ theme }) => ({
  width: 1,
  height: 16,
  margin: `0 ${theme.spacing.small}px`,
  background: theme.outline.weaker
}));

// Matches the height and corners of the small buttons next to it.
const SidebarToggle = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.radius.small
}));

const PopoverPanel = styled("div", {
  shouldForwardProp: (prop) => prop !== "noPadding"
})<{ noPadding?: boolean }>(({ theme, noPadding }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: noPadding ? 0 : theme.spacing.small,
  width: 280,
  padding: noPadding ? `0 0 ${theme.spacing.smallest}px` : theme.spacing.normal,
  borderRadius: theme.radius.small,
  border: `1px solid ${theme.outline.weaker}`,
  background: theme.bg[1],
  boxShadow: theme.shadow.popup
}));

const PopoverTitle = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.small}px ${theme.spacing.normal}px ${theme.spacing.smallest}px`
}));

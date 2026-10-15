import {
  Button,
  Icon,
  IconButton,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useState } from "react";

import { DEV_PLUGIN_PARAM, DevPluginError } from "./useDevPlugin";

// What the map area shows instead of, or on top of, the map: how to connect a
// plugin, why it couldn't load, problems with the running plugin, and loading.

// `reearth visualizer plugin dev` serves the plugin here by default.
const DEFAULT_PLUGIN_URL = "http://localhost:5180/plugin";
const DEV_COMMAND = "reearth visualizer plugin dev";

const openWithPlugin = (url: string) => {
  const params = new URLSearchParams(window.location.search);
  params.set(DEV_PLUGIN_PARAM, url.trim());
  window.location.search = params.toString();
};

/** A plugin server URL to open the workbench with. */
export const PluginUrlForm: FC<{ initialUrl?: string }> = ({ initialUrl }) => {
  const t = useT();
  const [value, setValue] = useState(initialUrl ?? DEFAULT_PLUGIN_URL);
  const submit = useCallback(() => {
    if (value.trim()) openWithPlugin(value);
  }, [value]);
  return (
    <Row>
      <Grow>
        <TextInput
          value={value}
          placeholder={DEFAULT_PLUGIN_URL}
          ariaLabel={t("Plugin URL")}
          onChange={setValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
      </Grow>
      <Button title={t("Load")} disabled={!value.trim()} onClick={submit} />
    </Row>
  );
};

const CopyCommand: FC = () => {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(DEV_COMMAND).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, []);
  return (
    <CommandRow>
      <Command>{DEV_COMMAND}</Command>
      <IconButton
        icon={copied ? "check" : "copy"}
        size="small"
        appearance="simple"
        tooltipText={copied ? t("Copied") : t("Copy")}
        ariaLabel={t("Copy command")}
        onClick={copy}
      />
    </CommandRow>
  );
};

/** Shown without ?dev-plugin=: how to get a plugin into the workbench. */
export const ConnectCard: FC = () => {
  const t = useT();
  return (
    <Overlay>
      <Card role="region" aria-label={t("Connect a plugin")}>
        <Typography size="h5" weight="bold">
          {t("Connect a plugin")}
        </Typography>
        <Typography size="body" color="weak">
          {t(
            "Run this in your plugin's folder. It serves the plugin and opens it here, and reloads it when you save."
          )}
        </Typography>
        <CopyCommand />
        <Divider />
        <Typography size="body" color="weak">
          {t("Or load a plugin from a server:")}
        </Typography>
        <PluginUrlForm />
        <Typography size="footnote" color="weak">
          {t(
            "The server must serve reearth.yml and a .js file for each extension. A change event on <url>/events reloads the plugin."
          )}
        </Typography>
      </Card>
    </Overlay>
  );
};

/** Shown when the plugin couldn't load and nothing earlier is running. */
export const LoadErrorCard: FC<{
  url: string;
  error: DevPluginError;
  loading: boolean;
  onRetry: () => void;
}> = ({ url, error, loading, onRetry }) => {
  const t = useT();
  const [changing, setChanging] = useState(false);
  const unreachable = error.kind === "unreachable";
  return (
    <Overlay>
      <Card role="alert">
        <Title>
          <Icon icon="warning" size="normal" color="currentColor" />
          <Typography size="h5" weight="bold">
            {unreachable
              ? t("Can't reach the plugin server")
              : t("Can't read reearth.yml")}
          </Typography>
        </Title>
        {unreachable ? (
          <>
            <Typography size="body" color="weak">
              {t("Nothing answered at {{url}}. Is this still running?", {
                url,
                interpolation: { escapeValue: false }
              })}
            </Typography>
            <CopyCommand />
          </>
        ) : (
          <Details>{error.message}</Details>
        )}
        <Row>
          <Button
            icon="arrowCounterClockWise"
            title={loading ? t("Retrying…") : t("Retry")}
            disabled={loading}
            onClick={onRetry}
          />
          {!changing && (
            <Button
              appearance="simple"
              title={t("Change URL")}
              onClick={() => setChanging(true)}
            />
          )}
        </Row>
        {changing && <PluginUrlForm initialUrl={url} />}
      </Card>
    </Overlay>
  );
};

/**
 * Problems with the running plugin: a reload that failed (the last working
 * version keeps running) or extensions whose .js didn't load.
 */
export const ProblemBanner: FC<{
  error?: DevPluginError;
  extensionErrors: Record<string, string>;
}> = ({ error, extensionErrors }) => {
  const t = useT();
  const messages = [
    ...(error
      ? [
          error.kind === "unreachable"
            ? t("Can't reach the plugin server.")
            : error.message
        ]
      : []),
    ...Object.values(extensionErrors)
  ];
  if (!messages.length) return null;
  return (
    <BannerWrapper>
      <Banner role="alert">
        <BannerIcon>
          <Icon icon="warning" size="normal" color="currentColor" />
        </BannerIcon>
        <div>
          {error && (
            <Typography size="body" weight="bold">
              {t("Showing the last version that loaded")}
            </Typography>
          )}
          {messages.map((m) => (
            <Details key={m}>{m}</Details>
          ))}
        </div>
      </Banner>
    </BannerWrapper>
  );
};

/** Covers the blank map while it mounts. */
export const MapLoading: FC = () => {
  const t = useT();
  return (
    <Overlay passive>
      <Typography size="body" color="weak">
        {t("Loading map…")}
      </Typography>
    </Overlay>
  );
};

const Overlay = styled("div", {
  shouldForwardProp: (prop) => prop !== "passive"
})<{ passive?: boolean }>(({ theme, passive }) => ({
  position: css.position.absolute,
  inset: 0,
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  padding: theme.spacing.large,
  zIndex: theme.zIndexes.visualizer.overlay,
  pointerEvents: passive ? "none" : "auto"
}));

const Card = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.normal,
  width: 420,
  maxWidth: "100%",
  padding: theme.spacing.super,
  borderRadius: theme.radius.normal,
  border: `1px solid ${theme.outline.weaker}`,
  background: theme.bg[1],
  boxShadow: theme.shadow.popup
}));

const Title = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  color: theme.warning.main
}));

const Row = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small
}));

const Grow = styled("div")({ flex: 1, minWidth: 0 });

const CommandRow = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  padding: `${theme.spacing.small}px ${theme.spacing.small}px ${theme.spacing.small}px ${theme.spacing.normal}px`,
  borderRadius: theme.radius.small,
  background: theme.bg[0]
}));

const Command = styled("code")(({ theme }) => ({
  flex: 1,
  fontFamily: theme.fonts.fontFamilies.code,
  fontSize: theme.fonts.sizes.body,
  color: theme.content.main,
  userSelect: "all"
}));

const Divider = styled("div")(({ theme }) => ({
  height: 1,
  background: theme.outline.weaker
}));

const Details = styled("p")(({ theme }) => ({
  margin: 0,
  fontFamily: theme.fonts.fontFamilies.code,
  fontSize: theme.fonts.sizes.footnote,
  color: theme.content.main,
  wordBreak: "break-word",
  whiteSpace: "pre-wrap"
}));

const BannerWrapper = styled("div")(({ theme }) => ({
  position: css.position.absolute,
  left: 0,
  right: 0,
  bottom: theme.spacing.super * 2,
  display: css.display.flex,
  justifyContent: css.justifyContent.center,
  padding: `0 ${theme.spacing.large}px`,
  zIndex: theme.zIndexes.visualizer.overlay,
  pointerEvents: "none"
}));

const Banner = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.small,
  maxWidth: 560,
  padding: `${theme.spacing.small}px ${theme.spacing.normal}px`,
  borderRadius: theme.radius.small,
  border: `1px solid ${theme.warning.weak}`,
  background: theme.bg[1],
  boxShadow: theme.shadow.popup,
  pointerEvents: "auto"
}));

const BannerIcon = styled("div")(({ theme }) => ({
  flexShrink: 0,
  paddingTop: theme.spacing.micro,
  color: theme.warning.main
}));

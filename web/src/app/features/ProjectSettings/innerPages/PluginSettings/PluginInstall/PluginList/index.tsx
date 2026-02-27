import { Typography } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import PluginListItem from "./PluginListItem";

export type PluginItem = {
  thumbnailUrl?: string;
  title: string;
  isInstalled: boolean;
  bodyMarkdown?: string;
  author: string;
  pluginId: string;
};

type PluginListProps = {
  plugins?: PluginItem[];
  uninstallPlugin: (pluginId: string) => void;
};

const PluginList: FC<PluginListProps> = ({ plugins, uninstallPlugin }) => {
  const t = useT();

  return plugins && plugins.length > 0 ? (
    <Wrapper>
      <InstalledHeader>
        <Typography size="body">{t("Installed Plugins")}</Typography>
      </InstalledHeader>
      <ListWrapper>
        {plugins.map((p) => (
          <PluginListItem
            key={p.pluginId}
            plugin={p}
            uninstallPlugin={uninstallPlugin}
          />
        ))}
      </ListWrapper>
    </Wrapper>
  ) : null;
};

export default PluginList;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.super
}));

const InstalledHeader = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  borderBottom: `solid 1px ${theme.outline.weak}`
}));

const ListWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.normal
}));

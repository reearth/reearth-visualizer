import { Icon, IconName, Typography } from "@reearth/app/lib/reearth-ui";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useMemo } from "react";

import { AssetOrigin, AssetTab } from "./types";

type Props = {
  origin: AssetOrigin;
  value: AssetTab;
  onChange: (tab: AssetTab) => void;
};

// The modal's header bar: a title for Visualizer assets, or tabs for CMS
// assets and models, selectable with Enter or Space.
const AssetTabs: FC<Props> = ({ origin, value, onChange }) => {
  const t = useT();
  const theme = useTheme();
  const tabs: { id: AssetTab; name: string; icon: IconName }[] = useMemo(
    () => [
      { id: "cmsAssets", name: t("CMS Assets"), icon: "cmsLogo" },
      { id: "cmsModels", name: t("CMS Models"), icon: "cmsLogo" }
    ],
    [t]
  );

  if (origin === "visualizer") {
    return (
      <Title data-testid="asset-layer-creator-title">
        <Icon icon="logo" size="small" color={theme.dangerous.main} />
        <Typography size="body">{t("Visualizer Project Assets")}</Typography>
      </Title>
    );
  }

  return (
    <TabList role="tablist">
      {tabs.map(({ id, name, icon }) => {
        const selected = id === value;
        return (
          <Tab
            key={id}
            role="tab"
            tabIndex={0}
            aria-selected={selected}
            selected={selected}
            onClick={() => onChange(id)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              onChange(id);
            }}
            data-testid={`asset-layer-creator-tab-${id}`}
          >
            <Icon icon={icon} size="small" color={theme.warning.main} />
            <Typography size="body">{name}</Typography>
            {id === "cmsModels" && (
              <Tooltip
                type="custom"
                icon="informationCircle"
                placement="bottom-end"
                offset={8}
                darkBackground
                text={t(
                  "Edits to the model in CMS will update added layer automatically"
                )}
              />
            )}
          </Tab>
        );
      })}
    </TabList>
  );
};

const Title = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest,
  flex: 1
}));

// Pulled to the header bar's edges so the active tab's underline sits on
// the header's bottom border.
const TabList = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flex: 1,
  alignSelf: "stretch",
  margin: `-${theme.spacing.normal}px 0 -${theme.spacing.normal}px -${theme.spacing.normal}px`
}));

const Tab = styled("div", {
  shouldForwardProp: (prop) => prop !== "selected"
})<{ selected: boolean }>(({ theme, selected }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest,
  padding: `0 ${theme.spacing.normal}px`,
  cursor: css.cursor.pointer,
  background: selected ? theme.select.weaker : "transparent",
  borderBottom: `2px solid ${selected ? theme.select.main : "transparent"}`,
  "&:focus-visible": {
    outline: `1px solid ${theme.select.main}`,
    outlineOffset: -1
  }
}));

export default AssetTabs;

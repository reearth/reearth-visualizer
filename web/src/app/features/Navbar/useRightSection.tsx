import { useEditorNavigation } from "@reearth/app/hooks/navigationHooks";
import { IconButton } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useMemo } from "react";

import useDevPlugins from "./useDevPlugins";

import { Tab } from ".";

type Props = {
  currentTab?: Tab;
  sceneId?: string;
  page: "editor" | "settings" | "projectSettings";
};

const useRightSide = ({ currentTab, page, sceneId }: Props) => {
  const t = useT();
  const handleEditorNavigation = useEditorNavigation({ sceneId });
  const {
    devPluginExtensions,
    handleDevPluginsInstall,
    handleDevPluginExtensionsReload
  } = useDevPlugins({ sceneId });

  const rightSide = useMemo(() => {
    if (page === "editor") {
      return (
        <RightSection data-testid="navbar-right-section">
          <TabButton
            onClick={() => handleEditorNavigation?.("map")}
            selected={currentTab === "map"}
            data-testid="navbar-tab-map"
          >
            {t("Map")}
          </TabButton>
          <TabButton
            onClick={() => handleEditorNavigation?.("story")}
            selected={currentTab === "story"}
            data-testid="navbar-tab-story"
          >
            {t("Story")}
          </TabButton>
          <TabButton
            onClick={() => handleEditorNavigation?.("widgets")}
            selected={currentTab === "widgets"}
            data-testid="navbar-tab-widgets"
          >
            {t("Widgets")}
          </TabButton>
          <TabButton
            onClick={() => handleEditorNavigation?.("publish")}
            selected={currentTab === "publish"}
            data-testid="navbar-tab-publish"
          >
            {t("Publish")}
          </TabButton>
          {!!devPluginExtensions && (
            <IconButton
              icon="pluginInstall"
              appearance="simple"
              onClick={handleDevPluginsInstall}
              data-testid="navbar-plugin-install"
            />
          )}
          {!!devPluginExtensions && (
            <IconButton
              icon="pluginUpdate"
              appearance="simple"
              onClick={handleDevPluginExtensionsReload}
              data-testid="navbar-plugin-reload"
            />
          )}
        </RightSection>
      );
    } else {
      return null;
    }
  }, [
    currentTab,
    handleEditorNavigation,
    page,
    t,
    devPluginExtensions,
    handleDevPluginsInstall,
    handleDevPluginExtensionsReload
  ]);

  return {
    rightSide
  };
};

const RightSection = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  gap: theme.spacing.smallest
}));

const TabButton = styled("button")<{ selected?: boolean }>(
  ({ selected, theme }) => ({
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
    fontSize: `${theme.fonts.sizes.body}px`,
    gap: theme.spacing.small,
    borderRadius: theme.radius.small,
    color: selected ? theme.content.main : theme.content.weak,
    background: selected ? theme.bg[3] : theme.bg[0],
    "&:hover": {
      background: theme.bg[3],
      color: theme.content.main
    }
  })
);

export default useRightSide;

import TabButton from "@reearth/beta/components/TabButton";
import { useEditorNavigation } from "@reearth/beta/hooks/navigationHooks";
import { IconButton } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useMemo } from "react";

import useDevPlugins from "./useDevPlugins";

import { Tab } from ".";

type Props = {
  currentTab?: Tab;
  sceneId?: string;
  page: "editor" | "settings";
};

const useRightSide = ({ currentTab, page, sceneId }: Props) => {
  const t = useT();
  const handleEditorNavigation = useEditorNavigation({ sceneId });
  const {
    devPluginExtensions,
    handleDevPluginsInstall,
    handleDevPluginExtensionsReload,
  } = useDevPlugins({ sceneId });

  const rightSide = useMemo(() => {
    if (page === "editor") {
      return (
        <RightSection>
          <TabButton
            onClick={() => handleEditorNavigation?.("map")}
            selected={currentTab === "map"}
            label={t("Map")}
          />
          <TabButton
            onClick={() => handleEditorNavigation?.("story")}
            selected={currentTab === "story"}
            label={t("Story")}
          />
          <TabButton
            onClick={() => handleEditorNavigation?.("widgets")}
            selected={currentTab === "widgets"}
            label={t("Widgets")}
          />
          <TabButton
            onClick={() => handleEditorNavigation?.("publish")}
            selected={currentTab === "publish"}
            label={t("Publish")}
          />
          {!!devPluginExtensions && (
            <IconButton
              icon="pluginInstall"
              appearance="simple"
              onClick={handleDevPluginsInstall}
            />
          )}
          {!!devPluginExtensions && (
            <IconButton
              icon="pluginUpdate"
              appearance="simple"
              onClick={handleDevPluginExtensionsReload}
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
    handleDevPluginExtensionsReload,
  ]);

  return {
    rightSide,
  };
};

const RightSection = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
`;

export default useRightSide;

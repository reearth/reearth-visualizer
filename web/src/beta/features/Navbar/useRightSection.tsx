import { useMemo } from "react";

import TabButton from "@reearth/beta/components/TabButton";
import { useEditorNavigation } from "@reearth/beta/hooks/navigationHooks";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { Tab } from ".";

type Props = {
  currentTab?: Tab;
  sceneId?: string;
  page: "editor" | "settings";
};

const useRightSide = ({ currentTab, page, sceneId }: Props) => {
  const t = useT();
  const handleEditorNavigation = useEditorNavigation({ sceneId });

  const rightSide = useMemo(() => {
    if (page === "editor") {
      return (
        <RightSection>
          <TabButton
            onClick={() => handleEditorNavigation?.("scene")}
            selected={currentTab === "scene"}
            label={t("Scene")}
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
        </RightSection>
      );
    } else {
      return null;
    }
  }, [currentTab, handleEditorNavigation, page, t]);

  return {
    rightSide,
  };
};

const RightSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 4px;
  height: 35px;
`;

export default useRightSide;

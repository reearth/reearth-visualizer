import { FC, useCallback } from "react";

import { EntryItem } from "@reearth/beta/ui/components";
import { Panel } from "@reearth/beta/ui/layout";
import { ScenePropertyCollection } from "@reearth/services/api/sceneApi";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useMapPage } from "../context";

const ScenePanel: FC = () => {
  const t = useT();

  const { scene, selectedSceneSetting, handleSceneSettingSelect } = useMapPage();

  // TODO-VizUI: use EntryItem
  const handleTranslatedCollectionName = useCallback(
    (name?: ScenePropertyCollection) => {
      return name === "main"
        ? t("Main")
        : name === "tiles"
        ? t("Tiles")
        : name === "terrain"
        ? t("Terrain")
        : name === "globe"
        ? t("Globe")
        : name === "sky"
        ? t("Sky")
        : name === "camera"
        ? t("Camera")
        : t("Unknown scene setting");
    },
    [t],
  );

  return (
    <Panel title={t("Scene")} storageId="editor-map-scene-panel">
      <Wrapper>
        {[...new Set(scene?.property?.schema?.groups.map(({ collection }) => collection))].map(
          (collection, index) =>
            collection && (
              <EntryItem
                key={index}
                title={handleTranslatedCollectionName(collection as ScenePropertyCollection)}
                highlighted={selectedSceneSetting === collection}
                onClick={() => handleSceneSettingSelect(collection)}
              />
            ),
        )}
      </Wrapper>
    </Panel>
  );
};

export default ScenePanel;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
}));

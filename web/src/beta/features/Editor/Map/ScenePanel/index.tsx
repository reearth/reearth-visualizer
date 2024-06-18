import { FC, useCallback } from "react";

import ListItem from "@reearth/beta/components/ListItem";
import { Panel } from "@reearth/beta/ui/layout";
import { Scene, ScenePropertyCollection } from "@reearth/services/api/sceneApi";
import { useT } from "@reearth/services/i18n";

export type ScenePanelProps = {
  scene?: Scene;
  selectedSceneSetting?: string;
  onSceneSettingSelect: (groupId: string) => void;
};

const ScenePanel: FC<ScenePanelProps> = ({ scene, selectedSceneSetting, onSceneSettingSelect }) => {
  const t = useT();

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
      {[...new Set(scene?.property?.schema?.groups.map(({ collection }) => collection))].map(
        (collection, index) =>
          collection && (
            <ListItem
              key={index}
              isSelected={selectedSceneSetting === collection}
              onItemClick={() => onSceneSettingSelect(collection)}>
              {handleTranslatedCollectionName(collection as ScenePropertyCollection)}
            </ListItem>
          ),
      )}
    </Panel>
  );
};

export default ScenePanel;

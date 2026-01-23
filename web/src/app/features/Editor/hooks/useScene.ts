import { convert } from "@reearth/services/api/property/utils";
import { useScene } from "@reearth/services/api/scene";
import { useState, useCallback, useMemo } from "react";

type SceneProps = {
  sceneId?: string;
  lang?: string;
};

export default function ({ sceneId }: SceneProps) {
  const [selectedSceneSetting, setSelectedSceneSetting] = useState<
    string | undefined
  >(undefined);

  const { scene } = useScene({ sceneId });
  const sceneSettings = useMemo(
    () =>
      convert(scene?.property)?.filter(
        (item) => item.collection === selectedSceneSetting
      ),
    [scene?.property, selectedSceneSetting]
  );
  const handleSceneSettingSelect = useCallback(
    (collection?: string) => setSelectedSceneSetting(collection),
    []
  );

  return {
    scene,
    selectedSceneSetting,
    sceneSettings,
    handleSceneSettingSelect
  };
}

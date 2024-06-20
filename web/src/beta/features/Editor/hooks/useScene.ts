import { useState, useCallback, useMemo } from "react";

import { useSceneFetcher } from "@reearth/services/api";
import { convert } from "@reearth/services/api/propertyApi/utils";

type SceneProps = {
  sceneId?: string;
};

export default function ({ sceneId }: SceneProps) {
  const { useSceneQuery } = useSceneFetcher();
  const [selectedSceneSetting, setSelectedSceneSetting] = useState<string | undefined>(undefined);

  const { scene } = useSceneQuery({ sceneId });
  const sceneSettings = useMemo(
    () => convert(scene?.property)?.filter(item => item.collection === selectedSceneSetting),
    [scene?.property, selectedSceneSetting],
  );
  const handleSceneSettingSelect = useCallback(
    (collection?: string) =>
      setSelectedSceneSetting(
        !collection || selectedSceneSetting === collection ? undefined : collection,
      ),
    [selectedSceneSetting, setSelectedSceneSetting],
  );

  return {
    scene,
    selectedSceneSetting,
    sceneSettings,
    handleSceneSettingSelect,
  };
}

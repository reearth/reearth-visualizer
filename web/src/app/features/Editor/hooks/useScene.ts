import { useSceneFetcher } from "@reearth/services/api";
import { convert } from "@reearth/services/api/propertyApi/utils";
import { useState, useCallback, useMemo } from "react";

type SceneProps = {
  sceneId?: string;
  lang?: string;
};

export default function ({ sceneId }: SceneProps) {
  const { useSceneQuery } = useSceneFetcher();
  const [selectedSceneSetting, setSelectedSceneSetting] = useState<
    string | undefined
  >(undefined);

  const { scene } = useSceneQuery({ sceneId });
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

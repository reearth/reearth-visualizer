import { useCallback, useMemo, useState } from "react";

import { useSceneFetcher } from "@reearth/services/api";
import { convert } from "@reearth/services/api/propertyApi/utils";

type SceneProps = {
  sceneId?: string;
};

export default function ({ sceneId }: SceneProps) {
  const { useSceneQuery } = useSceneFetcher();
  const [selectedSceneSetting, setSceneSetting] = useState<string | undefined>();

  const { scene } = useSceneQuery({ sceneId });
  const sceneSettings = useMemo(
    () => convert(scene?.property)?.filter(item => item.collection === selectedSceneSetting),
    [scene?.property, selectedSceneSetting],
  );
  const handleSceneSettingSelect = useCallback(
    (collection: string) =>
      setSceneSetting(selected => (selected === collection ? undefined : collection)),
    [],
  );

  return {
    scene,
    selectedSceneSetting,
    handleSceneSettingSelect,
    sceneSettings,
  };
}

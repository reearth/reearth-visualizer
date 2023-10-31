import { useCallback, useState } from "react";

import { useSceneFetcher } from "@reearth/services/api";

type SceneProps = {
  sceneId?: string;
};

export default function ({ sceneId }: SceneProps) {
  const { useSceneQuery } = useSceneFetcher();
  const [selectedSceneSetting, setSceneSetting] = useState<string | undefined>();

  const { scene } = useSceneQuery({ sceneId });
  const handleSceneSettingSelect = useCallback(
    (collection: string) => setSceneSetting(collection),
    [],
  );

  return {
    scene,
    selectedSceneSetting,
    handleSceneSettingSelect,
  };
}

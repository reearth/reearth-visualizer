import { useCesiumIonAccessToken } from "@reearth/app/features/Editor/atoms";
import { convert } from "@reearth/services/api/property/utils";
import { useScene } from "@reearth/services/api/scene";
import { useState, useCallback, useMemo, useEffect } from "react";

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

  // Extract and set Cesium Ion access token from scene property
  const [, setCesiumIonAccessToken] = useCesiumIonAccessToken();
  useEffect(() => {
    // Extract token from scene property (Main settings -> default group -> ion field)
    const defaultGroup = convert(scene?.property)?.find(
      (item) => item.schemaGroup === "default"
    );

    // Type guard: default group should be a Group (not GroupList)
    const ionField =
      defaultGroup && "fields" in defaultGroup
        ? defaultGroup.fields.find((f) => f.id === "ion")
        : undefined;

    const token =
      typeof ionField?.value === "string" && ionField.value.trim().length > 0
        ? ionField.value
        : undefined;

    setCesiumIonAccessToken(token);
  }, [scene?.property, setCesiumIonAccessToken]);

  return {
    scene,
    selectedSceneSetting,
    sceneSettings,
    handleSceneSettingSelect
  };
}

import { FC, useCallback, useState, useEffect } from "react";

import URLField from "@reearth/beta/components/fields/URLField";
import { NLSAppearance } from "@reearth/services/api/appearanceApi/utils";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";

import { LayerConfigUpdateProps } from "../../../useLayers";

type AppearanceSelectorProps = {
  appearances?: NLSAppearance[];
  layers?: NLSLayer[];
  selectedLayerId: string;
  sceneId?: string;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
};

const AppearanceSelector: FC<AppearanceSelectorProps> = ({
  layers,
  appearances,
  selectedLayerId,
  sceneId,
  onLayerConfigUpdate,
}) => {
  const t = useT();

  const [urlFieldValue, setUrlFieldValue] = useState("");

  useEffect(() => {
    const initialAppearanceId = layers?.find(a => a.id === selectedLayerId)?.config?.appearanceId;
    const newInitialAppearanceName =
      appearances?.find(a => a.id === initialAppearanceId)?.name || "";

    setUrlFieldValue(newInitialAppearanceName);
  }, [selectedLayerId, layers, appearances]);

  const handleUrlFieldChange = useCallback(
    (value?: string) => {
      const appearanceName = appearances?.find(a => a.id === value)?.name;
      setUrlFieldValue(appearanceName || "");
      onLayerConfigUpdate?.({
        layerId: selectedLayerId,
        config: {
          appearanceId: value,
        },
      });
    },
    [appearances, onLayerConfigUpdate, selectedLayerId],
  );

  return (
    <URLField
      fileType="appearance"
      assetType="appearance"
      value={urlFieldValue}
      name={t("Appearance")}
      sceneId={sceneId}
      onChange={handleUrlFieldChange}
    />
  );
};

export default AppearanceSelector;

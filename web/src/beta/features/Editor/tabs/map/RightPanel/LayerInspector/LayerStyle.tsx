import { FC, useCallback, useState, useEffect } from "react";

import URLField from "@reearth/beta/components/fields/URLField";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";

import { LayerConfigUpdateProps } from "../../../../useLayers";

type LayerStyleSelectorProps = {
  layerStyles?: LayerStyle[];
  layers?: NLSLayer[];
  selectedLayerId: string;
  sceneId?: string;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
};

const LayerStyleTab: FC<LayerStyleSelectorProps> = ({
  layers,
  layerStyles,
  selectedLayerId,
  sceneId,
  onLayerConfigUpdate,
}) => {
  const t = useT();

  const [urlFieldValue, setUrlFieldValue] = useState("");

  useEffect(() => {
    const initialLayerStyleId = layers?.find(a => a.id === selectedLayerId)?.config?.layerStyleId;
    const newInitialLayerStyleName =
      layerStyles?.find(a => a.id === initialLayerStyleId)?.name || "";

    setUrlFieldValue(newInitialLayerStyleName);
  }, [selectedLayerId, layers, layerStyles]);

  const handleUrlFieldChange = useCallback(
    (value?: string) => {
      const layerStyleName = layerStyles?.find(a => a.id === value)?.name;
      setUrlFieldValue(layerStyleName || "");
      onLayerConfigUpdate?.({
        layerId: selectedLayerId,
        config: {
          layerStyleId: value,
        },
      });
    },
    [layerStyles, onLayerConfigUpdate, selectedLayerId],
  );

  return (
    <URLField
      fileType="layerStyle"
      entityType="layerStyle"
      value={urlFieldValue}
      name={t("Layer Style")}
      sceneId={sceneId}
      onChange={handleUrlFieldChange}
    />
  );
};

export default LayerStyleTab;

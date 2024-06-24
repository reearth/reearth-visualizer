import { FC, useCallback, useMemo } from "react";

import { Selector } from "@reearth/beta/lib/reearth-ui/components/Selector";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";

import { LayerConfigUpdateProps } from "../../../../hooks/useLayers";

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
  onLayerConfigUpdate,
}) => {
  const layerStyleOptions = useMemo(
    () => [
      { value: "", label: "NO STYLE" },
      ...(layerStyles?.map(ls => ({ value: ls.id, label: ls.name })) ?? []),
    ],
    [layerStyles],
  );

  const handleLayerStyleChange = useCallback(
    (value?: string | string[]) => {
      if (typeof value !== "string") return;
      onLayerConfigUpdate?.({
        layerId: selectedLayerId,
        config: {
          layerStyleId: value,
        },
      });
    },
    [selectedLayerId, onLayerConfigUpdate],
  );

  const currentValue = useMemo(
    () => layers?.find(a => a.id === selectedLayerId)?.config?.layerStyleId,
    [layers, selectedLayerId],
  );

  return (
    <Selector options={layerStyleOptions} value={currentValue} onChange={handleLayerStyleChange} />
  );
};

export default LayerStyleTab;

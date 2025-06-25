import { SelectField } from "@reearth/app/ui/fields";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { FC, useCallback, useMemo } from "react";

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
  onLayerConfigUpdate
}) => {
  const t = useT();
  const layerStyleOptions = useMemo(
    () => [
      { value: "", label: t("NO STYLE") },
      ...(layerStyles?.map((ls) => ({ value: ls.id, label: ls.name })) ?? [])
    ],
    [layerStyles, t]
  );

  const handleLayerStyleChange = useCallback(
    (value?: string | string[]) => {
      if (typeof value !== "string") return;
      onLayerConfigUpdate?.({
        layerId: selectedLayerId,
        config: {
          layerStyleId: value
        }
      });
    },
    [selectedLayerId, onLayerConfigUpdate]
  );

  const currentValue = useMemo(
    () => layers?.find((a) => a.id === selectedLayerId)?.config?.layerStyleId,
    [layers, selectedLayerId]
  );

  return (
    <SelectField
      title={t("Layer Style")}
      options={layerStyleOptions}
      value={currentValue}
      maxHeight={250}
      onChange={handleLayerStyleChange}
    />
  );
};

export default LayerStyleTab;

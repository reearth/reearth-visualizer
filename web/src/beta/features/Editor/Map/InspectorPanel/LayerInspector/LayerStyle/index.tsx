import { FC, useCallback, useMemo } from "react";

import { Selector } from "@reearth/beta/lib/reearth-ui/components/Selector";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";

import { LayerConfigUpdateProps } from "../../../../hooks/useLayers";
import { InputGroup } from "../../../SharedComponent";

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
  const t = useT();
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
    <InputGroup label={t("Layer Style")}>
      <Selector
        options={layerStyleOptions}
        value={currentValue}
        onChange={handleLayerStyleChange}
      />
    </InputGroup>
  );
};

export default LayerStyleTab;

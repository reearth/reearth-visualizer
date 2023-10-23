import BottomPanel from "@reearth/beta/features/Editor/BottomPanel";
import {
  LayerStyleAddProps,
  LayerStyleNameUpdateProps,
} from "@reearth/beta/features/Editor/useLayerStyles";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";

import LayerStyles from "./LayerStyle";

type Props = {
  layerStyles: LayerStyle[];
  selectedLayerStyleId?: string;
  onLayerStyleAdd: (inp: LayerStyleAddProps) => void;
  onLayerStyleDelete: (id: string) => void;
  onLayerStyleNameUpdate: (inp: LayerStyleNameUpdateProps) => void;
  onLayerStyleSelect: (id: string) => void;
};

const MapBottomPanel: React.FC<Props> = ({
  layerStyles,
  selectedLayerStyleId,
  onLayerStyleAdd,
  onLayerStyleDelete,
  onLayerStyleNameUpdate,
  onLayerStyleSelect,
}) => {
  const t = useT();

  return (
    <BottomPanel
      content={{
        id: "layerStyle",
        title: t("Layer Style"),
        children: (
          <LayerStyles
            layerStyles={layerStyles}
            selectedLayerStyleId={selectedLayerStyleId}
            onLayerStyleAdd={onLayerStyleAdd}
            onLayerStyleDelete={onLayerStyleDelete}
            onLayerStyleNameUpdate={onLayerStyleNameUpdate}
            onLayerStyleSelect={onLayerStyleSelect}
          />
        ),
      }}
    />
  );
};

export default MapBottomPanel;

import { Layer, MapRef } from "@reearth/core";
import { styled } from "@reearth/services/theme";
import { FC, MutableRefObject, useCallback } from "react";

import LayerItem from "./LayerItem";

type Props = {
  handleLayerVisibilityUpdate: (layerId: string, visible: boolean) => void;
  layers: Layer[];
  selectedLayerId: string;
  setSelectedLayerId: (layerId: string) => void;
  visualizerRef: MutableRefObject<MapRef | null>;
};

const LayerList: FC<Props> = ({
  handleLayerVisibilityUpdate,
  layers,
  selectedLayerId,
  setSelectedLayerId,
  visualizerRef
}) => {
  const handleFlyTo = useCallback(
    (layerId: string, options: { duration: number }) => {
      visualizerRef.current?.engine.flyTo?.(layerId, options);
    },
    [visualizerRef]
  );

  return (
    <Wrapper>
      {layers &&
        layers.map((l) => (
          <LayerItem
            handleLayerVisibilityUpdate={handleLayerVisibilityUpdate}
            key={l.id}
            layer={l}
            onFlyTo={handleFlyTo}
            selectedLayerId={selectedLayerId}
            setSelectedLayerId={setSelectedLayerId}
          />
        ))}
    </Wrapper>
  );
};

const Wrapper = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  padding: theme.spacing.smallest
}));

export default LayerList;

import { Layer, MapRef } from "@reearth/core";
import { styled } from "@reearth/services/theme";
import { FC, MutableRefObject, useCallback, useState } from "react";

import LayerItem from "./LayerItem";

type Props = {
  handleLayerVisibilityUpdate: (layerId: string, visible: boolean) => void;
  layers: Layer[];
  visualizerRef: MutableRefObject<MapRef | null>;
};

const LayerList: FC<Props> = ({
  handleLayerVisibilityUpdate,
  layers,
  visualizerRef
}) => {
  const handleFlyTo = useCallback(
    (layerId: string, options: { duration: number }) => {
      visualizerRef.current?.engine.flyTo?.(layerId, options);
    },
    [visualizerRef]
  );

  const [selectedLayerId, setSelectedLayerId] = useState("");

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

const Wrapper = styled.div(() => ({
  display: "flex",
  flexDirection: "column",
  overflow: "auto"
}));

export default LayerList;

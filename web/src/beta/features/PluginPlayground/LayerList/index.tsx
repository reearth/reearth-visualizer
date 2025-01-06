import { MapRef } from "@reearth/core";
import { styled } from "@reearth/services/theme";
import { FC, MutableRefObject, useCallback } from "react";

import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "./constants";
import LayerItem from "./LayerItem";

type Props = {
  visualizerRef: MutableRefObject<MapRef | null>;
};

const LayerList: FC<Props> = ({ visualizerRef }) => {
  const handleFlyTo = useCallback(
    (layerId: string, options: { duration: number }) => {
      visualizerRef.current?.engine.flyTo?.(layerId, options);
    },
    [visualizerRef]
  );

  return (
    <Wrapper>
      {DEFAULT_LAYERS_PLUGIN_PLAYGROUND &&
        DEFAULT_LAYERS_PLUGIN_PLAYGROUND.map((l) => (
          <LayerItem key={l.id} layer={l} onFlyTo={handleFlyTo} />
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

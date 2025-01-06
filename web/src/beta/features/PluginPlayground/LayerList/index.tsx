import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "./constants";
import LayerItem from "./LayerItem";

const LayerList: FC = () => {
  return (
    <Wrapper>
      {DEFAULT_LAYERS_PLUGIN_PLAYGROUND &&
        DEFAULT_LAYERS_PLUGIN_PLAYGROUND.map((l) => (
          <LayerItem key={l.id} layer={l} />
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

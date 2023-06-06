import React from "react";

import LayerTagPane from "./LayerTagPane";
import SceneTagPane from "./SceneTagPane";

export type Props = {
  className?: string;
  mode: "scene" | "layer";
};

const TagPane: React.FC<Props> = ({ mode }) => {
  return mode === "layer" ? <LayerTagPane /> : <SceneTagPane />;
};

export default TagPane;

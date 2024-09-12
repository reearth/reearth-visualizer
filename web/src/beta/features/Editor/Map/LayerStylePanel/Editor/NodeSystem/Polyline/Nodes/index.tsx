import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";

import ClampToGround from "./ClampToGround";
import ShowNode from "./Show";
import StrokeColorNode from "./StrokeColorNode";
import StrokeWidthNode from "./StrokeWidthNode";

export const componentNode: Record<
  string,
  FC<
    LayerStyleProps & {
      styleType: "marker" | "polyline" | "polygon" | "threedtiles" | "model";
    }
  >
> = {
  show: ShowNode,
  clampToGround: ClampToGround,
  strokeWidth: StrokeWidthNode,
  strokeColor: StrokeColorNode
};

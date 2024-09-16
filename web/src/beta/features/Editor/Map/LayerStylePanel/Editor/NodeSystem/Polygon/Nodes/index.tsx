import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";

import FillColorNode from "./FillColorNode";
import FillNode from "./FillNode";
import ShowNode from "./Show";
import StrokeColorNode from "./StrokeColorNode";
import StrokeNode from "./StrokeNode";
import StrokeWidthNode from "./StrokeWidthNode";

export const componentNode: Record<string, FC<LayerStyleProps>> = {
  show: ShowNode,
  fill: FillNode,
  fillColor: FillColorNode,
  stroke: StrokeNode,
  strokeWidth: StrokeWidthNode,
  strokeColor: StrokeColorNode
};

import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import HeightReferenceNode from "../../../SharedNode/HeightReference";

import HeightNode from "./Height";
import PointColorNode from "./PointColor";
import PointSizeNode from "./PointSize";
import ShowNode from "./Show";
import StylesNode from "./Styles";

export const componentNode: Record<
  string,
  FC<
    LayerStyleProps & {
      styleType: "marker" | "polyline" | "polygon" | "threedtiles" | "model";
    }
  >
> = {
  show: ShowNode,
  height: HeightNode,
  heightReference: HeightReferenceNode,
  pointSize: PointSizeNode,
  pointColor: PointColorNode,
  style: StylesNode
};

import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import HeightReferenceNode from "../../common/sharedNode/HeightReference";
import PointSizeNode from "../../common/sharedNode/PointSize";
import ShowNode from "../../common/sharedNode/Show";
import {
  AppearanceType,
  HeightReferenceAppearanceType
} from "../../common/type";

import HeightNode from "./Height";
import PointColorNode from "./PointColor";
import StylesNode from "./Styles";

export const componentNode: Record<
  string,
  FC<
    LayerStyleProps & {
      appearanceType: AppearanceType;
    }
  >
> = {
  show: ShowNode,
  height: HeightNode,
  heightReference: HeightReferenceNode as FC<
    LayerStyleProps & HeightReferenceAppearanceType
  >,
  pointColor: PointColorNode,
  pointSize: PointSizeNode,
  style: StylesNode,
  image: PointSizeNode,
  imageSize: StylesNode
};

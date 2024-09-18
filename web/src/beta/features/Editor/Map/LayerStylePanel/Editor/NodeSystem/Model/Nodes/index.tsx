import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import HeightReferenceNode from "../../common/nodes/HeightReference";
import ShowNode from "../../common/nodes/Show";
import {
  AppearanceType,
  HeightReferenceAppearanceType
} from "../../common/type";

import UrlNode from "./Url";

export const componentNode: Record<
  string,
  FC<
    LayerStyleProps & {
      appearanceType: AppearanceType;
    }
  >
> = {
  show: ShowNode,
  heightReference: HeightReferenceNode as FC<
    LayerStyleProps & HeightReferenceAppearanceType
  >,
  url: UrlNode
};

import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ShowNode from "../../common/sharedNode/Show";
import StrokeColorNode from "../../common/sharedNode/StrokeColor";
import StrokeWidthNode from "../../common/sharedNode/StrokeWidth";
import { AppearanceType } from "../../common/type";

import FillColorNode from "./FillColorNode";

export const componentNode: Record<
  string,
  FC<
    LayerStyleProps & {
      appearanceType: AppearanceType;
    }
  >
> = {
  show: ShowNode,
  fillColor: FillColorNode,
  strokeWidth: StrokeWidthNode,
  strokeColor: StrokeColorNode
};

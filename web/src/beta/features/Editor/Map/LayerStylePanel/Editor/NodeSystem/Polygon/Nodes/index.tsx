import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ShowNode from "../../common/nodes/Show";
import StrokeColorNode from "../../common/nodes/StrokeColor";
import StrokeWidthNode from "../../common/nodes/StrokeWidth";
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

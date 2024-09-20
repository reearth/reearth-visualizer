import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ShowNode from "../../common/nodes/Show";
import StrokeColorNode from "../../common/nodes/StrokeColor";
import StrokeWidthNode from "../../common/nodes/StrokeWidth";
import { AppearanceType } from "../../common/type";

import ClampToGroundNode from "./ClampToGround";

export const componentNode: Record<
  string,
  FC<
    LayerStyleProps & {
      appearanceType: AppearanceType;
    }
  >
> = {
  show: ShowNode,
  clampToGround: ClampToGroundNode,
  strokeWidth: StrokeWidthNode,
  strokeColor: StrokeColorNode
};

import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ShowNode from "../../common/sharedNode/Show";
import StrokeColorNode from "../../common/sharedNode/StrokeColor";
import StrokeWidthNode from "../../common/sharedNode/StrokeWidth";
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

import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import { AppearanceType } from "../../common/type";

import ClampToGroundNode from "./ClampToGround";
import ShowNode from "./Show";
import StrokeColorNode from "./StrokeColorNode";
import StrokeWidthNode from "./StrokeWidthNode";

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

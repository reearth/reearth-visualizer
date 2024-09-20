import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ShowNode from "../../common/nodes/Show";
import { AppearanceType } from "../../common/type";

import ColorNode from "./ColorNode";
import StyleUrlNode from "./StyleUrlNode";

export const componentNode: Record<
  string,
  FC<
    LayerStyleProps & {
      appearanceType: AppearanceType;
    }
  >
> = {
  show: ShowNode,
  color: ColorNode,
  styleUrl: StyleUrlNode
};

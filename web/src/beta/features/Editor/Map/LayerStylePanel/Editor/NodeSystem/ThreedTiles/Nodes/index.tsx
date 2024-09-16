import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";

import ColorNode from "./ColorNode";
import ShowNode from "./Show";
import StyleUrlNode from "./StyleUrlNode";

export const componentNode: Record<string, FC<LayerStyleProps>> = {
  show: ShowNode,
  color: ColorNode,
  styleUrl: StyleUrlNode
};

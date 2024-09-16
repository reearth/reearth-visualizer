import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";

import HeightReferenceNode from "./HeightReference";
import ShowNode from "./Show";
import UrlNode from "./Url";

export const componentNode: Record<string, FC<LayerStyleProps>> = {
  show: ShowNode,
  heightReference: HeightReferenceNode,
  url: UrlNode
};

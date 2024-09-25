import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import useDynamicNodes from "../hook";
import { polygonNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./polygonNodes";

type PolygonProps = {
  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

const Polygon: FC<PolygonProps> = ({
  layerStyle,
  setMenuItems,
  setLayerStyle
}) => {
  const { dynamicNodeContent } = useDynamicNodes({
    appearanceType: "polygon",
    layerStyle,
    nodeCategoryMenu: polygonNodeMenu,
    componentNode,
    setMenuItems,
    setLayerStyle
  });

  return <Wrapper>{dynamicNodeContent}</Wrapper>;
};

export default Polygon;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  alignItems: "flex-start",
  padding: `0 ${theme.spacing.small}px`
}));

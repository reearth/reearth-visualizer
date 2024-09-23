import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import useHooks from "../hook";
import { polygonNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./nodes";

type PolygonProps = {
  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

const Polygon: FC<PolygonProps> = ({
  layerStyle,
  setMenuItems,
  setLayerStyle
}) => {
  const { dynamicNodeContent } = useHooks({
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
  alignItems: "flex-start"
}));

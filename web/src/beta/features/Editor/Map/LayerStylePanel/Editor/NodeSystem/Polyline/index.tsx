import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import useHooks from "../hook";
import { polylineNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./nodes";

type PolylineProps = {
  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

const Polyline: FC<PolylineProps> = ({
  layerStyle,
  setMenuItems,
  setLayerStyle
}) => {
  const { dynamicNodeContent } = useHooks({
    appearanceType: "polyline",
    layerStyle,
    nodeCategoryMenu: polylineNodeMenu,
    componentNode,
    setMenuItems,
    setLayerStyle
  });
  return <Wrapper>{dynamicNodeContent}</Wrapper>;
};

export default Polyline;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  alignItems: "flex-start"
}));

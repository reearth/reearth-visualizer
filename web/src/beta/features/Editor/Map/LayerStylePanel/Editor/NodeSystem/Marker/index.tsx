import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import useHooks from "../hook";
import { markerNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./markerNodes";

type MarkerProps = {
  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

const Marker: FC<MarkerProps> = ({
  layerStyle,
  setMenuItems,
  setLayerStyle
}) => {
  const { dynamicNodeContent } = useHooks({
    appearanceType: "marker",
    layerStyle,
    nodeCategoryMenu: markerNodeMenu,
    componentNode,
    setMenuItems,
    setLayerStyle
  });

  return <Wrapper>{dynamicNodeContent}</Wrapper>;
};

export default Marker;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  alignItems: "flex-start"
}));

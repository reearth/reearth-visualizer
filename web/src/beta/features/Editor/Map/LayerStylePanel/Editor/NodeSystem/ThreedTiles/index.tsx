import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import useHooks from "../hook";
import { threedtilesNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./threedtilesNodes";

type ThreedTilesProps = {
  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

const ThreedTiles: FC<ThreedTilesProps> = ({
  layerStyle,
  setMenuItems,
  setLayerStyle
}) => {
  const { dynamicNodeContent } = useHooks({
    appearanceType: "3dtiles",
    layerStyle,
    nodeCategoryMenu: threedtilesNodeMenu,
    componentNode,
    setMenuItems,
    setLayerStyle
  });

  return <Wrapper>{dynamicNodeContent}</Wrapper>;
};

export default ThreedTiles;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  alignItems: "flex-start"
}));

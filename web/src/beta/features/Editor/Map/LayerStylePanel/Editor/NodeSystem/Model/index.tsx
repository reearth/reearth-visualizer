import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import useDynamicNodes from "../hook";
import { modelNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./modelNodes";

type ThreedModelProps = {
  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

const ThreedModel: FC<ThreedModelProps> = ({
  layerStyle,
  setMenuItems,
  setLayerStyle
}) => {
  const { dynamicNodeContent } = useDynamicNodes({
    appearanceType: "model",
    layerStyle,
    nodeCategoryMenu: modelNodeMenu,
    componentNode,
    setMenuItems,
    setLayerStyle
  });

  return <Wrapper>{dynamicNodeContent}</Wrapper>;
};

export default ThreedModel;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  alignItems: "flex-start",
  padding: `0 ${theme.spacing.small}px`
}));
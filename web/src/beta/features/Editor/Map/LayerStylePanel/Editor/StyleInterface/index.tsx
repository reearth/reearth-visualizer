import { PopupMenuItem, TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { styled, useTheme } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC, useCallback, useEffect, useMemo, useState } from "react";

import NoStyleMessage from "../NoStyleMessage";

import {
  appearaceNodes,
  appearanceTypes,
  appearanceTypeIcons
} from "./appearanceNodes";
import { converToLayerStyleValue, convertToStyleNodes } from "./convert";
import StylePanel from "./StylePanel";
import { AppearanceType, StyleNode, StyleNodes } from "./types";

export type LayerStyleProps = {
  layerStyle: LayerStyle | undefined;
  setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>;
  optionsMenu?: PopupMenuItem[];
};

const StyleInterface: FC<LayerStyleProps> = ({ layerStyle, setLayerStyle }) => {
  const theme = useTheme();

  const [styleNodes, setStyleNodes] = useState<StyleNodes>(
    convertToStyleNodes(layerStyle)
  );

  useEffect(() => {
    setStyleNodes(convertToStyleNodes(layerStyle));
  }, [layerStyle]);

  const handleStyleNodesUpdate = useCallback(
    (type: AppearanceType, nodes: StyleNode[]) => {
      setLayerStyle((prev) =>
        prev
          ? {
              id: prev.id,
              name: prev.name,
              value: converToLayerStyleValue({
                ...styleNodes,
                [type]: nodes
              })
            }
          : undefined
      );
    },
    [styleNodes, setLayerStyle]
  );

  const [activeTab, setActiveTab] = useState<AppearanceType>("marker");

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as AppearanceType);
  }, []);

  const appearanceTypeTabs: TabItem[] = useMemo(
    () =>
      appearanceTypes.map((type) => ({
        id: type,
        icon: appearanceTypeIcons[type],
        children: (
          <StylePanel
            key={type}
            type={type}
            appearanceNodes={appearaceNodes[type]}
            styleNodes={styleNodes[type]}
            onStyleNodesUpdate={handleStyleNodesUpdate}
          />
        )
      })),
    [handleStyleNodesUpdate, styleNodes]
  );

  return layerStyle ? (
    <Wrapper>
      <Tabs
        tabs={appearanceTypeTabs}
        position="top"
        alignment="center"
        background={theme.bg[1]}
        noPadding
        currentTab={activeTab}
        onChange={handleTabChange}
      />
    </Wrapper>
  ) : (
    <NoStyleMessage />
  );
};

export default StyleInterface;

const Wrapper = styled("div")(({ theme }) => ({
  width: "100%",
  paddingTop: theme.spacing.small,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  flex: 1
}));

import { TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { styled, useTheme } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC, useCallback, useEffect, useMemo, useState } from "react";

import { LayerStyleWithActiveTab } from "../hooks";
import NoStyleMessage from "../NoStyleMessage";

import {
  appearanceNodes,
  appearanceTypes,
  appearanceTypeIcons
} from "./appearanceNodes";
import { convertToLayerStyleValue, convertToStyleNodes } from "./convert";
import { StylePanel } from "./StylePanel";
import { AppearanceType, StyleNode, StyleNodes } from "./types";

export type LayerStyleProps = {
  layerStyle: LayerStyle | undefined;
  setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>;
  layerStyleWithActiveTab: LayerStyleWithActiveTab[];
  setLayerStyleWithActiveTab: Dispatch<
    SetStateAction<LayerStyleWithActiveTab[]>
  >;
};

const StyleInterface: FC<LayerStyleProps> = ({
  layerStyle,
  setLayerStyle,
  layerStyleWithActiveTab,
  setLayerStyleWithActiveTab
}) => {
  const theme = useTheme();

  const [styleNodes, setStyleNodes] = useState<StyleNodes>(
    convertToStyleNodes(layerStyle)
  );
  const [activeTab, setActiveTab] = useState<AppearanceType>("marker");

  useEffect(() => {
    setStyleNodes(convertToStyleNodes(layerStyle));

    const newLayerStyleWithActiveTab = layerStyleWithActiveTab.find(
      (tab) => tab.id === layerStyle?.id
    );
    if (newLayerStyleWithActiveTab) {
      setActiveTab(newLayerStyleWithActiveTab.tab);
    } else {
      setActiveTab("marker");
    }
  }, [layerStyle, layerStyleWithActiveTab]);

  const handleStyleNodesUpdate = useCallback(
    (type: AppearanceType, nodes: StyleNode[]) => {
      setLayerStyle((prev) =>
        prev
          ? {
              id: prev.id,
              name: prev.name,
              value: convertToLayerStyleValue({
                ...styleNodes,
                [type]: nodes
              })
            }
          : undefined
      );
    },
    [styleNodes, setLayerStyle]
  );

  const handleTabChange = useCallback(
    (tab: string) => {
      const appearanceTab = tab as AppearanceType;
      setActiveTab(appearanceTab);

      setLayerStyleWithActiveTab((prev) =>
        layerStyle
          ? [
              ...prev.filter((lt) => lt.id !== layerStyle.id),
              { id: layerStyle.id, tab: appearanceTab }
            ]
          : prev
      );
    },
    [layerStyle, setLayerStyleWithActiveTab]
  );

  const appearanceTypeTabs: TabItem[] = useMemo(
    () =>
      appearanceTypes.map((type) => ({
        id: type,
        icon: appearanceTypeIcons[type],
        children: (
          <StylePanel
            key={type}
            type={type}
            appearanceNodes={appearanceNodes[type]}
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

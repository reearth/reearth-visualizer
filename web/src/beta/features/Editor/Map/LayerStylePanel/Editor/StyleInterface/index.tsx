import { TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { styled, useTheme } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC, useCallback, useEffect, useMemo, useState } from "react";

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
  editMode?: boolean;
  setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>;
};
export type LayerStyleWithActiveTab = { id: string; tab: AppearanceType };

const LAYER_STYLE_ACTIVE_TAB_STORAGE_KEY = `reearth-visualizer-layer-style-active-tab`;

const StyleInterface: FC<LayerStyleProps> = ({
  layerStyle,
  editMode,
  setLayerStyle
}) => {
  const theme = useTheme();

  const [styleNodes, setStyleNodes] = useState<StyleNodes>(
    convertToStyleNodes(layerStyle)
  );

  const layerStyleWithActiveTab: LayerStyleWithActiveTab[] = useMemo(() => {
    const savedData = localStorage.getItem(LAYER_STYLE_ACTIVE_TAB_STORAGE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error("Failed to parse layer style active tab data:", error);
        return [];
      }
    }
    return [];
  }, []);

  const currentLayerStyleForTab = useMemo(() => {
    return layerStyleWithActiveTab?.find(({ id }) => id === layerStyle?.id);
  }, [layerStyleWithActiveTab, layerStyle?.id]);

  const [activeTab, setActiveTab] = useState<AppearanceType>(
    currentLayerStyleForTab?.tab || "marker"
  );

  useEffect(() => {
    setStyleNodes(convertToStyleNodes(layerStyle));
  }, [layerStyle, layerStyleWithActiveTab, currentLayerStyleForTab]);

  useEffect(() => {
    if (currentLayerStyleForTab) {
      setActiveTab(currentLayerStyleForTab.tab);
    }
  }, [layerStyle?.id, currentLayerStyleForTab]);

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

      const updatedLayerStyleWithActiveTab = layerStyle
        ? [
            ...layerStyleWithActiveTab.filter(({ id }) => id !== layerStyle.id),
            { id: layerStyle.id, tab: appearanceTab }
          ]
        : layerStyleWithActiveTab;

      localStorage.setItem(
        LAYER_STYLE_ACTIVE_TAB_STORAGE_KEY,
        JSON.stringify(updatedLayerStyleWithActiveTab)
      );
    },
    [layerStyle, layerStyleWithActiveTab]
  );

  const appearanceTypeTabs: TabItem[] = useMemo(
    () =>
      appearanceTypes.map((type) => ({
        id: type,
        icon: appearanceTypeIcons[type],
        showToolTip: true,
        tooltipText: `${type === "model" ? "3D " : ""}${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} style`,
        children: (
          <StylePanel
            key={type}
            type={type}
            editMode={editMode}
            appearanceNodes={appearanceNodes[type]}
            styleNodes={styleNodes[type]}
            onStyleNodesUpdate={handleStyleNodesUpdate}
          />
        )
      })),
    [editMode, handleStyleNodesUpdate, styleNodes]
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

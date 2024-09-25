import {
  Button,
  PopupMenu,
  PopupMenuItem,
  TabItem,
  Tabs
} from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC, useState } from "react";

import Marker from "./NodeSystem/Marker";
import ThreedModel from "./NodeSystem/Model";
import Polygon from "./NodeSystem/Polygon";
import Polyline from "./NodeSystem/Polyline";
import ThreedTiles from "./NodeSystem/ThreedTiles";
import NoStyleMessage from "./NoStyleMessage";

export type LayerStyleProps = {
  layerStyle: LayerStyle | undefined;
  setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>;
  optionsMenu?: PopupMenuItem[];
};

const InterfaceTab: FC<
  LayerStyleProps & {
    activeTab: string;
    setActiveTab: Dispatch<SetStateAction<string>>;
  }
> = ({ layerStyle, setLayerStyle, activeTab, setActiveTab }) => {
  const theme = useTheme();
  const t = useT();
  const [menuItems, setMenuItems] = useState<PopupMenuItem[]>([]);

  const createTabsItem = (
    layerStyle: LayerStyle | undefined,
    setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>,
    setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>
  ): TabItem[] => [
    {
      id: "marker",
      icon: "points",
      children: (
        <Marker
          layerStyle={layerStyle}
          setLayerStyle={setLayerStyle}
          setMenuItems={setMenuItems}
        />
      )
    },
    {
      id: "polyline",
      icon: "polyline",
      children: (
        <Polyline
          layerStyle={layerStyle}
          setLayerStyle={setLayerStyle}
          setMenuItems={setMenuItems}
        />
      )
    },
    {
      id: "polygon",
      icon: "polygon",
      children: (
        <Polygon
          layerStyle={layerStyle}
          setLayerStyle={setLayerStyle}
          setMenuItems={setMenuItems}
        />
      )
    },
    {
      id: "threedtiles",
      icon: "buildings",
      children: (
        <ThreedTiles
          layerStyle={layerStyle}
          setLayerStyle={setLayerStyle}
          setMenuItems={setMenuItems}
        />
      )
    },
    {
      id: "model",
      icon: "cube",
      children: (
        <ThreedModel
          layerStyle={layerStyle}
          setLayerStyle={setLayerStyle}
          setMenuItems={setMenuItems}
        />
      )
    }
  ];

  const tabsItem = createTabsItem(layerStyle, setLayerStyle, setMenuItems);
  return layerStyle ? (
    <Wrapper>
      <TabsWrapper>
        <Tabs
          tabs={tabsItem}
          position="top"
          alignment="center"
          background={theme.bg[1]}
          noPadding
          currentTab={activeTab}
          sharedContent={
            layerStyle ? (
              <PopupMenu
                extendTriggerWidth
                width={315}
                menu={menuItems}
                label={
                  <Button
                    title={t("New node")}
                    extendWidth
                    size="small"
                    icon="plus"
                    appearance="primary"
                  />
                }
              />
            ) : (
              <NoStyleMessage />
            )
          }
          onChange={setActiveTab}
        />
      </TabsWrapper>
    </Wrapper>
  ) : (
    <NoStyleMessage />
  );
};

export default InterfaceTab;

const Wrapper = styled("div")(() => ({
  width: "100%"
}));

const TabsWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  height: "calc(100vh - 345px)",
  overflowY: "auto"
}));

import { Button, PopupMenu, TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC, ReactNode, useCallback, useState } from "react";

import Marker from "./Marker";
import StylesNode from "./Marker/Styles";
import {
  markerNodeMenu,
  polylineNodeMenu,
  polygonNodeMenu,
  threedtilesNodeMenu,
  modelNodeMenu
} from "./NodeCategory";
import NoStyleMessage from "./NoStyleMessage";

type InterfaceTabProps = {
  layerStyle: LayerStyle | undefined;
  setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>;
};

const InterfaceTab: FC<InterfaceTabProps> = ({
  layerStyle,
  setLayerStyle: _todo
}) => {
  const theme = useTheme();
  const t = useT();

  const [activeTab, setActiveTab] = useState<string>("marker");
  const [dynamicContent, setDynamicContent] = useState<ReactNode>(null);

  const tabsItem: TabItem[] = [
    {
      id: "marker",
      icon: "points",
      children: <Marker dynamicContent={dynamicContent} />
    },
    { id: "polyline", icon: "polyline", children: null },
    { id: "polygon", icon: "polygon", children: null },
    { id: "threedtiles", icon: "buildings", children: null },
    { id: "model", icon: "cube", children: null }
  ];

  const handleMenuClick = useCallback((id: string) => {
    switch (id) {
      case "style":
        setDynamicContent(<StylesNode />);
        break;
      // Add cases for other menu items if needed
      default:
        setDynamicContent(null);
        break;
    }
  }, []);

  const getNodeMenu = () => {
    const nodeMenu =
      activeTab === "marker"
        ? markerNodeMenu
        : activeTab === "polyline"
          ? polylineNodeMenu
          : activeTab === "polygon"
            ? polygonNodeMenu
            : activeTab === "threedtiles"
              ? threedtilesNodeMenu
              : modelNodeMenu;

    return nodeMenu.map((item) => ({
      ...item,
      onClick: () => handleMenuClick(item.id) // Attach onClick handler
    }));
  };


  return layerStyle ? (
    <Wrapper>
      <TabsWrapper>
        <Tabs
          tabs={tabsItem}
          position="top"
          alignment="center"
          background={theme.bg[1]}
          noPadding
          onChange={(id) => setActiveTab(id)}
        />
      </TabsWrapper>
      {layerStyle && (
        <PopupMenu
          extendTriggerWidth
          width={276}
          menu={getNodeMenu()}
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
      )}
    </Wrapper>
  ) : (
    <NoStyleMessage />
  );
};

export default InterfaceTab;

const Wrapper = styled("div")(() => ({
  width: "100%"
}));

const TabsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: `${theme.spacing.small}px 0`
}));

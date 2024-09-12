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

import Marker from "./Marker";
import NoStyleMessage from "./NoStyleMessage";
import Polyline from "./Polyline";

export type LayerStyleProps = {
  layerStyle: LayerStyle | undefined;
  setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>;
  optionsMenu?: PopupMenuItem[];
};

const InterfaceTab: FC<LayerStyleProps> = ({ layerStyle, setLayerStyle }) => {
  const theme = useTheme();
  const t = useT();
  const [menuItems, setMenuItems] = useState<PopupMenuItem[]>([]);

  const tabsItem: TabItem[] = [
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
      children: <Polyline setCurrentMenu={setMenuItems} />
    },
    { id: "polygon", icon: "polygon", children: null },
    { id: "threedtiles", icon: "buildings", children: null },
    { id: "model", icon: "cube", children: null }
  ];

  return layerStyle ? (
    <Wrapper>
      <TabsWrapper>
        <Tabs
          tabs={tabsItem}
          position="top"
          alignment="center"
          background={theme.bg[1]}
          noPadding
          sharedContent={
            layerStyle ? (
              <PopupMenu
                extendTriggerWidth
                width={276}
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

const TabsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: `${theme.spacing.small}px 0`,
  height: "480px"
}));

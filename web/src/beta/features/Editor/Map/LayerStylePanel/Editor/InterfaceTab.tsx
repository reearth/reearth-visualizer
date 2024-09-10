import { Button, TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import NoStyleMessage from "./NoStyleMessage";

type InterfaceTabProps = {
  layerStyle: LayerStyle | undefined;
  setLayerStyle: Dispatch<SetStateAction<LayerStyle | undefined>>;
};

const InterfaceTab: FC<InterfaceTabProps> = ({
  layerStyle,
  setLayerStyle: _todo // avoid unused variable warning
}) => {
  const theme = useTheme();
  const t = useT();

  //Null will be replaced by corresponding component on next step
  const tabsItem: TabItem[] = [
    {
      id: "marker",
      icon: "points",
      children: null
    },
    {
      id: "polyline",
      icon: "polyline",
      children: null
    },
    {
      id: "polygon",
      icon: "polygon",
      children: null
    },
    {
      id: "threedtiles",
      icon: "buildings",
      children: null
    },
    {
      id: "model",
      icon: "cube",
      children: null
    }
  ];

  return layerStyle ? (
    <Wrapper>
      <TabsWrapper>
        <Tabs
          tabs={tabsItem}
          position="top"
          alignment="center"
          background={theme.bg[1]}
        />
      </TabsWrapper>
      {layerStyle && (
        <Button
          title={t("New node")}
          extendWidth
          size="small"
          icon="plus"
          appearance="primary"
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

const TabsWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column"
}));

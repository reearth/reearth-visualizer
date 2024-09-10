import { Button, TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

import SharedNoStyleMessage from "../../shared/SharedNoStyleMessage";

type LayerStyleInterfaceProps = {
  selectedLayerStyleId?: string;
  localLayerStyle?: LayerStyle;
};

const LayerStyleInterface: FC<LayerStyleInterfaceProps> = ({
  selectedLayerStyleId
}) => {
  const theme = useTheme();
  const t = useT();

  //Null will be replaced by corresponding component on next step
  const tabsItem: TabItem[] = [
    {
      id: "marker",
      icon: "points",
      children: selectedLayerStyleId ? null : <SharedNoStyleMessage />
    },
    {
      id: "polyline",
      icon: "polyline",
      children: selectedLayerStyleId ? null : <SharedNoStyleMessage />
    },
    {
      id: "polygon",
      icon: "polygon",
      children: selectedLayerStyleId ? null : <SharedNoStyleMessage />
    },
    {
      id: "3d",
      icon: "buildings",
      children: selectedLayerStyleId ? null : <SharedNoStyleMessage />
    },
    {
      id: "3d-tiles",
      icon: "cube",
      children: selectedLayerStyleId ? null : <SharedNoStyleMessage />
    }
  ];

  return (
    <Wrapper>
      <TabsWrapper>
        <Tabs
          tabs={tabsItem}
          position="top"
          alignment="center"
          background={theme.bg[1]}
        />
      </TabsWrapper>
      {selectedLayerStyleId && (
        <Button
          title={t("New node")}
          extendWidth
          size="small"
          icon="plus"
          appearance="primary"
        />
      )}
    </Wrapper>
  );
};

export default LayerStyleInterface;

const Wrapper = styled("div")(() => ({
  width: "100%"
}));

const TabsWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column"
}));

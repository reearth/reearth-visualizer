import { FC } from "react";

import { Collapse } from "@reearth/beta/lib/reearth-ui";
import { EntryItem } from "@reearth/beta/ui/components";
import CheckBoxField from "@reearth/beta/ui/fields/CheckboxField";
import PropertyItem from "@reearth/beta/ui/fields/Properties";
import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useStoryPage } from "../context";

import useHooks from "./hooks";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const PageSettingsPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
  const { selectedStoryPage, layers, handleStoryPageUpdate, tab, handleFlyTo } = useStoryPage();

  const { allCheckedLayers, checkedLayers, visibleItems, handleAllLayersCheck, handleLayerCheck } =
    useHooks({
      layers,
      selectedPage: selectedStoryPage,
      onPageUpdate: handleStoryPageUpdate,
    });

  const t = useT();

  return (
    <Panel
      title={t("Page Settings")}
      storageId="editor-widgets-page-settings-panel"
      extend
      alwaysOpen
      showCollapseArea={showCollapseArea}
      areaRef={areaRef}>
      {selectedStoryPage && (
        <Wrapper>
          {tab == "story" && (
            <Collapse title={t("Layers")} size="small">
              {layers && layers.length > 0 && (
                <LayerWrapper>
                  <AllLayers>
                    <CheckBoxField onChange={handleAllLayersCheck} value={allCheckedLayers} />
                    <Title>{t("All Layers")}</Title>
                  </AllLayers>
                  <LayerList>
                    {layers.map(layer => (
                      <Layer key={layer.id}>
                        <CheckBoxField
                          onChange={() => handleLayerCheck(layer.id)}
                          value={checkedLayers.includes(layer.id)}
                        />
                        <EntryItem icon="file" title={layer.title} disableHover />
                      </Layer>
                    ))}
                  </LayerList>
                </LayerWrapper>
              )}
            </Collapse>
          )}

          {visibleItems?.map((i, idx) => (
            <Collapse key={idx} title={i.title ?? t("Settings")} size="small">
              <PropertyItem
                key={i.id}
                propertyId={selectedStoryPage.property.id}
                item={i}
                onFlyTo={handleFlyTo}
              />
            </Collapse>
          ))}
        </Wrapper>
      )}
    </Panel>
  );
};

export default PageSettingsPanel;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  padding: theme.spacing.smallest,
}));

const LayerWrapper = styled("div")(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
}));

const AllLayers = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  borderBottom: `1px solid ${theme.outline.weak}`,
  marginBottom: theme.spacing.small,
  paddingBottom: theme.spacing.small,
  gap: theme.spacing.small,
}));

const LayerList = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  maxHeight: "136px",
  overflowY: "auto",
  overflowX: "hidden",
  width: "100%",
}));

const Layer = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
}));

const Title = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

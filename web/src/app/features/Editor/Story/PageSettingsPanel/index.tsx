import { Collapse } from "@reearth/app/lib/reearth-ui";
import { EntryItem } from "@reearth/app/ui/components";
import CheckBoxField from "@reearth/app/ui/fields/CheckBoxField";
import PropertyItem from "@reearth/app/ui/fields/Properties";
import { Panel, PanelProps } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import { useStoryPage } from "../context";

import useHooks from "./hooks";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const PageSettingsPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
  const { selectedStoryPage, layers, handleStoryPageUpdate, tab, handleFlyTo } =
    useStoryPage();

  const {
    allCheckedLayers,
    checkedLayers,
    visibleItems,
    handleAllLayersCheck,
    handleLayerCheck
  } = useHooks({
    layers,
    selectedPage: selectedStoryPage,
    onPageUpdate: handleStoryPageUpdate
  });

  const t = useT();

  return (
    <Panel
      title={t("Page Settings")}
      storageId="editor-widgets-page-settings-panel"
      dataTestid="editor-widgets-page-settings-panel"
      extend
      alwaysOpen
      showCollapseArea={showCollapseArea}
      areaRef={areaRef}
      data-testid="editor-widgets-page-settings-panel"
    >
      {selectedStoryPage && (
        <Wrapper data-testid="page-settings-wrapper">
          {tab == "story" && (
            <Collapse
              title={t("Layers")}
              size="small"
              data-testid="page-settings-layers-collapse"
            >
              {layers && layers.length > 0 && (
                <LayerWrapper data-testid="page-settings-layer-wrapper">
                  <AllLayers data-testid="page-settings-all-layers">
                    <CheckBoxField
                      onChange={handleAllLayersCheck}
                      value={allCheckedLayers}
                      data-testid="page-settings-all-layers-checkbox"
                    />
                    <Title data-testid="page-settings-all-layers-title">
                      {t("All Layers")}
                    </Title>
                  </AllLayers>
                  <LayerList data-testid="page-settings-layer-list">
                    {layers.map((layer) => (
                      <Layer
                        key={layer.id}
                        data-testid={`page-settings-layer-${layer.id}`}
                      >
                        <CheckBoxField
                          onChange={() => handleLayerCheck(layer.id)}
                          value={checkedLayers.includes(layer.id)}
                          data-testid={`page-settings-layer-checkbox-${layer.id}`}
                        />
                        <EntryItem
                          icon="file"
                          title={layer.title}
                          disableHover
                          data-testid={`page-settings-layer-title-${layer.id}`}
                        />
                      </Layer>
                    ))}
                  </LayerList>
                </LayerWrapper>
              )}
            </Collapse>
          )}

          {visibleItems?.map((i, idx) => (
            <Collapse
              key={idx}
              title={i.title ?? t("Settings")}
              size="small"
              data-testid={`page-settings-property-collapse-${i.id}`}
            >
              <PropertyItem
                key={i.id}
                propertyId={selectedStoryPage.property.id}
                item={i}
                onFlyTo={handleFlyTo}
                data-testid={`page-settings-property-item-${i.id}`}
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
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small,
  padding: theme.spacing.smallest
}));

const LayerWrapper = styled("div")(() => ({
  width: "100%",
  display: css.display.flex,
  flexDirection: css.flexDirection.column
}));

const AllLayers = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  borderBottom: `1px solid ${theme.outline.weak}`,
  marginBottom: theme.spacing.small,
  paddingBottom: theme.spacing.small,
  gap: theme.spacing.small
}));

const LayerList = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  height: "352px",
  overflowY: css.overflow.auto,
  overflowX: css.overflow.hidden,
  width: "100%"
}));

const Layer = styled("div")(() => ({
  display: css.display.flex,
  alignItems: css.alignItems.center
}));

const Title = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis,
  whiteSpace: css.whiteSpace.nowrap
}));

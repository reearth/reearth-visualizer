import { FC } from "react";

import { Collapse } from "@reearth/beta/lib/reearth-ui";
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
              {layers && layers?.length > 0 && (
                <LayerWrapper>
                  <AllLayers>
                    <CheckBoxField
                      title={t("All Layers")}
                      onClick={handleAllLayersCheck}
                      checked={allCheckedLayers}
                    />
                  </AllLayers>
                  {layers?.map((layer, idx) => (
                    <Layer key={idx}>
                      <CheckBoxField
                        onClick={() => handleLayerCheck(layer.id)}
                        checked={checkedLayers.includes(layer.id)}
                        title={layer.title}
                        isIcon
                      />
                    </Layer>
                  ))}
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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LayerWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
`;

const Layer = styled.div`
  padding: 6px 4px;
`;

const AllLayers = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
  padding: 6px 4px;
`;

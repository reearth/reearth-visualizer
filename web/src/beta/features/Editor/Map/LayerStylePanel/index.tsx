import { FC, useCallback } from "react";

import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import { Button } from "@reearth/beta/lib/reearth-ui";
import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useMapPage } from "../context";

import LayerStyleCard from "./LayerStyleCard";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const StylesPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
  const {
    layerStyles,
    selectedLayerStyleId,
    handleLayerStyleAdd,
    handleLayerStyleDelete,
    handleLayerStyleNameUpdate,
    handleLayerStyleSelect,
  } = useMapPage();

  const t = useT();

  const handleLayerStyleAddition = useCallback(() => {
    handleLayerStyleAdd({ name: `${t("Style_")}${layerStyles?.length ?? 0 + 1}`, value: {} });
  }, [layerStyles?.length, t, handleLayerStyleAdd]);

  const handleSelectLayerStyle = useCallback(
    (layerStyle?: LayerStyle) => {
      if (!layerStyle) return;
      handleLayerStyleSelect(layerStyle.id);
    },
    [handleLayerStyleSelect],
  );

  return (
    <Panel
      title={t("Layer Style")}
      extend
      alwaysOpen
      storageId="editor-map-scene-panel"
      showCollapseArea={showCollapseArea}
      areaRef={areaRef}>
      <LayerStyleContainer>
        <Button icon="plus" extendWidth onClick={handleLayerStyleAddition} title="New Style" />
        <CatalogListWrapper>
          {layerStyles?.map(layerStyle => (
            <LayerStyleCard
              id={layerStyle.id}
              key={layerStyle.id}
              name={layerStyle.name}
              onLayerStyleNameUpdate={handleLayerStyleNameUpdate}
              selected={layerStyle.id === selectedLayerStyleId}
              actionContent={
                <PopoverMenuContent
                  size="sm"
                  items={[
                    {
                      name: t("Delete"),
                      icon: "bin",
                      onClick: (e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        handleLayerStyleDelete(layerStyle.id);
                      },
                    },
                  ]}
                />
              }
              onSelect={() => handleSelectLayerStyle(layerStyle)}
            />
          ))}
        </CatalogListWrapper>
      </LayerStyleContainer>
    </Panel>
  );
};

export default StylesPanel;

const LayerStyleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const CatalogListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 12px;
  overflow-y: auto;
  padding: 12px 8px;
`;

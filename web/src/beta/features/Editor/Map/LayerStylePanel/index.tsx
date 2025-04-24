import { IconButton } from "@reearth/beta/lib/reearth-ui";
import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo } from "react";

import { useMapPage } from "../context";

import LayerStyleEditor from "./Editor";
import LayerStyleItem from "./LayerStyleItem";
import PresetLayerStyle from "./PresetLayerStyle";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const StylesPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
  const {
    selectedLayer,
    layerStyles,
    selectedLayerStyleId,
    handleLayerStyleAdd,
    handleLayerStyleDelete,
    handleLayerStyleNameUpdate,
    handleLayerStyleSelect,
    handleLayerStyleValueUpdate,
    handleLayerConfigUpdate
  } = useMapPage();

  const t = useT();

  const handleSelectLayerStyle = useCallback(
    (id?: string) => {
      handleLayerStyleSelect(id);
    },
    [handleLayerStyleSelect]
  );

  const handleApplyLayerStyle = useCallback(() => {
    if (!selectedLayer?.layer?.id || !selectedLayerStyleId) return;
    handleLayerConfigUpdate?.({
      layerId: selectedLayer.layer.id,
      config: {
        layerStyleId: selectedLayerStyleId
      }
    });
  }, [selectedLayer, selectedLayerStyleId, handleLayerConfigUpdate]);

  const selectedLayerStyle = useMemo(
    () => layerStyles?.find((a) => a.id === selectedLayerStyleId),
    [layerStyles, selectedLayerStyleId]
  );

  return (
    <Panel
      title={t("Layer Style")}
      extend
      alwaysOpen
      storageId="editor-map-scene-panel"
      showCollapseArea={showCollapseArea}
      areaRef={areaRef}
      noPadding
      dataTestid="editor-map-scene-panel"
    >
      <LayerStyleManager onClick={() => handleSelectLayerStyle(undefined)}>
        <ActionsWrapper>
          <PresetLayerStyle
            layerStyles={layerStyles}
            onLayerStyleAdd={handleLayerStyleAdd}
            onLayerStyleSelect={handleSelectLayerStyle}
          />
          <IconButton
            icon="return"
            size="large"
            disabled={!selectedLayer || !selectedLayerStyleId}
            onClick={handleApplyLayerStyle}
            stopPropagationOnClick
            placement="top"
            tooltipText={t("Assign style")}
          />
        </ActionsWrapper>
        <StylesWrapper>
          <StylesGrid>
            {layerStyles?.map((layerStyle) => (
              <LayerStyleItem
                id={layerStyle.id}
                key={layerStyle.id}
                name={layerStyle.name}
                onLayerStyleNameUpdate={handleLayerStyleNameUpdate}
                onSelect={() => handleSelectLayerStyle(layerStyle.id)}
                onDelete={() => handleLayerStyleDelete(layerStyle.id)}
                selected={layerStyle.id === selectedLayerStyleId}
              />
            ))}
          </StylesGrid>
        </StylesWrapper>
      </LayerStyleManager>
      <LayerStyleEditor
        selectedLayerStyle={selectedLayerStyle}
        onLayerStyleValueUpdate={handleLayerStyleValueUpdate}
      />
    </Panel>
  );
};

export default StylesPanel;

const LayerStyleManager = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  height: 154,
  gap: theme.spacing.small,
  padding: theme.spacing.small
}));

const ActionsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

const StylesWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  overflowY: "auto",
  padding: `${theme.spacing.small}px`,
  background: theme.relative.darker,
  borderRadius: `${theme.radius.normal}px`
}));

const StylesGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: `${theme.spacing.small}px`
}));

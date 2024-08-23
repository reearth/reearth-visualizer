import { FC, useCallback } from "react";

import { IconButton } from "@reearth/beta/lib/reearth-ui";
import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useMapPage } from "../context";

import LayerStyleEditor from "./LayerStyleEditor";
import LayerStyleItem from "./LayerStyleItem";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const StylesPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
  const {
    sceneId,
    selectedLayer,
    layerStyles,
    selectedLayerStyleId,
    handleLayerStyleAdd,
    handleLayerStyleDelete,
    handleLayerStyleNameUpdate,
    handleLayerStyleSelect,
    handleLayerStyleValueUpdate,
    handleLayerConfigUpdate,
  } = useMapPage();

  const t = useT();

  const handleLayerStyleAddition = useCallback(() => {
    handleLayerStyleAdd({ name: `${t("Style_")}${layerStyles?.length ?? 0 + 1}`, value: {} });
  }, [layerStyles?.length, t, handleLayerStyleAdd]);

  const handleSelectLayerStyle = useCallback(
    (id?: string) => {
      handleLayerStyleSelect(id);
    },
    [handleLayerStyleSelect],
  );

  const handleApplyLayerStyle = useCallback(() => {
    if (!selectedLayer?.layer?.id || !selectedLayerStyleId) return;
    handleLayerConfigUpdate?.({
      layerId: selectedLayer.layer.id,
      config: {
        layerStyleId: selectedLayerStyleId,
      },
    });
  }, [selectedLayer, selectedLayerStyleId, handleLayerConfigUpdate]);

  return (
    <Panel
      title={t("Layer Style")}
      extend
      alwaysOpen
      storageId="editor-map-scene-panel"
      showCollapseArea={showCollapseArea}
      areaRef={areaRef}>
      <LayerStyleManager>
        <ActionsWrapper>
          <IconButton icon="plus" size="large" onClick={handleLayerStyleAddition} />
          <IconButton
            icon="return"
            size="large"
            disabled={!selectedLayer || !selectedLayerStyleId}
            onClick={handleApplyLayerStyle}
          />
        </ActionsWrapper>
        <StylesWrapper onClick={() => handleSelectLayerStyle(undefined)}>
          <StylesGrid>
            {layerStyles?.map(layerStyle => (
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
      <LayerStyleEditorWrapper>
        {selectedLayerStyleId && (
          <LayerStyleEditor
            selectedLayerStyleId={selectedLayerStyleId}
            sceneId={sceneId}
            onLayerStyleValueUpdate={handleLayerStyleValueUpdate}
          />
        )}
      </LayerStyleEditorWrapper>
    </Panel>
  );
};

export default StylesPanel;

const LayerStyleManager = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  flex: 1,
  height: "30%",
  maxHeight: 300,
  gap: theme.spacing.small,
}));

const ActionsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
}));

const StylesWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  overflowY: "auto",
  padding: `${theme.spacing.small}px`,
  background: theme.relative.darker,
  borderRadius: `${theme.radius.normal}px`,
}));

const StylesGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: `${theme.spacing.small}px`,
}));

const LayerStyleEditorWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flex: 1,
  height: "70%",
  paddingTop: theme.spacing.small,
}));

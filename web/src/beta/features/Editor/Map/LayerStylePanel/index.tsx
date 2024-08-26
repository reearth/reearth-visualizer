import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import { Button } from "@reearth/beta/lib/reearth-ui";
import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback } from "react";

import { useMapPage } from "../context";

import LayerStyleCard from "./LayerStyleCard";
import LayerStyleEditor from "./LayerStyleEditor";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const StylesPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
  const {
    sceneId,
    layerStyles,
    selectedLayerStyleId,
    handleLayerStyleAdd,
    handleLayerStyleDelete,
    handleLayerStyleNameUpdate,
    handleLayerStyleSelect,
    handleLayerStyleValueUpdate,
  } = useMapPage();

  const t = useT();

  const handleLayerStyleAddition = useCallback(() => {
    handleLayerStyleAdd({
      name: `${t("Style_")}${layerStyles?.length ?? 0 + 1}`,
      value: {},
    });
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
      areaRef={areaRef}
    >
      <LayerStyleContainer>
        <Button
          icon="plus"
          extendWidth
          size="small"
          onClick={handleLayerStyleAddition}
          title={t("New Style")}
        />
        <CatalogListWrapper editorOpened={!!selectedLayerStyleId}>
          {layerStyles?.map((layerStyle) => (
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
      {selectedLayerStyleId && (
        <LayerStyleEditor
          selectedLayerStyleId={selectedLayerStyleId}
          sceneId={sceneId}
          onLayerStyleValueUpdate={handleLayerStyleValueUpdate}
        />
      )}
    </Panel>
  );
};

export default StylesPanel;

const LayerStyleContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  marginBottom: theme.spacing.small,
}));

const CatalogListWrapper = styled("div")<{ editorOpened?: boolean }>(
  ({ theme, editorOpened }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))",
    gridGap: `${theme.spacing.small}px`,
    justifyContent: "space-between",
    maxHeight: editorOpened ? "200px" : "auto",
    overflowY: "auto",
    padding: `${theme.spacing.small}px`,
    background: theme.relative.darker,
    borderRadius: `${theme.radius.normal}px`,
  }),
);

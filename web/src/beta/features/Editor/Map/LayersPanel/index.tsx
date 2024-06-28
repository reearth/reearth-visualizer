import { FC, useCallback, useMemo, useState } from "react";

import { Button, PopupMenu, DragAndDropList } from "@reearth/beta/lib/reearth-ui";
import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useMapPage } from "../context";

import LayerItem from "./LayerItem";

const LAYERS_DRAG_HANDLE_CLASS_NAME = "reearth-visualizer-editor-layers-drag-handle";

const LayersPanel: FC = () => {
  const {
    layers,
    handleLayerMove,
    handleLayerSelect,
    openDataSourceLayerCreator,
    openSketchLayerCreator,
  } = useMapPage();

  const t = useT();

  const newLayerMenu = useMemo(() => {
    return [
      {
        id: "add-datasorce-layer",
        title: t("Add Layer from Resource"),
        icon: "file" as const,
        onClick: () => {
          openDataSourceLayerCreator();
        },
      },
      {
        id: "add-sketch-layer",
        title: t("Add Sketch Layer"),
        icon: "pencilSimple" as const,
        onClick: () => {
          openSketchLayerCreator();
        },
      },
    ];
  }, [openDataSourceLayerCreator, openSketchLayerCreator, t]);

  const [isDragging, setIsDragging] = useState(false);
  const [editingLayerNameId, setEditingLayerNameId] = useState("");

  const DraggableLayerItems = useMemo(
    () =>
      layers.map(layer => ({
        id: layer.id,
        content: (
          <LayerItem
            layer={layer}
            dragHandleClassName={LAYERS_DRAG_HANDLE_CLASS_NAME}
            isDragging={isDragging}
            editingLayerNameId={editingLayerNameId}
            setEditingLayerNameId={setEditingLayerNameId}
          />
        ),
      })),
    [layers, isDragging, editingLayerNameId],
  );

  const handleMoveStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMoveEnd = useCallback(
    (itemId?: string, newIndex?: number) => {
      if (itemId !== undefined && newIndex !== undefined) {
        handleLayerMove({ layerId: itemId, index: newIndex });
      }
      setIsDragging(false);
    },
    [handleLayerMove],
  );

  return (
    <Panel title={t("Layers")} storageId="editor-map-layers-panel" extend>
      <Wrapper>
        <PopupMenu
          label={<Button icon="plus" title="New Layer" size="small" extendWidth />}
          extendTriggerWidth
          placement="bottom-end"
          menu={newLayerMenu}
        />
        <LayersContainer>
          <DragAndDropList
            items={DraggableLayerItems}
            handleClassName={LAYERS_DRAG_HANDLE_CLASS_NAME}
            onMoveEnd={handleMoveEnd}
            onMoveStart={handleMoveStart}
            dragDisabled={false}
          />
          <EmptySpace onClick={() => handleLayerSelect(undefined)} />
        </LayersContainer>
      </Wrapper>
    </Panel>
  );
};

export default LayersPanel;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  paddingTop: theme.spacing.smallest,
  height: "100%",
}));

const LayersContainer = styled("div")(() => ({
  flex: 1,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
}));

const EmptySpace = styled("div")(() => ({
  flex: 1,
  minHeight: 50,
}));

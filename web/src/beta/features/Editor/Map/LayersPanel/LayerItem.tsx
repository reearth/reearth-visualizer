import { Dispatch, FC, ReactNode, SetStateAction, useCallback, useMemo } from "react";

import { IconButton, TextInput } from "@reearth/beta/lib/reearth-ui";
import { EntryItem } from "@reearth/beta/ui/components";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { styled } from "@reearth/services/theme";

import { useMapPage } from "../context";

interface LayerItemProps {
  layer: NLSLayer;
  dragHandleClassName?: string;
  isDragging?: boolean;
  editingLayerNameId: string;
  setEditingLayerNameId: Dispatch<SetStateAction<string>>;
}

const LayerItem: FC<LayerItemProps> = ({
  layer,
  dragHandleClassName,
  isDragging,
  editingLayerNameId,
  setEditingLayerNameId,
}) => {
  const {
    selectedLayerId,
    handleLayerSelect,
    handleLayerDelete,
    handleLayerNameUpdate,
    handleLayerVisibilityUpdate,
    handleFlyTo,
  } = useMapPage();

  const handleZoomToLayer = useCallback(() => {
    handleFlyTo?.(layer.id, { duration: 0 });
  }, [layer.id, handleFlyTo]);

  const handleToggleLayerVisibility = useCallback(() => {
    handleLayerVisibilityUpdate({ layerId: layer.id, visible: !layer.visible });
  }, [layer.id, layer.visible, handleLayerVisibilityUpdate]);

  const optionsMenu = useMemo(
    () => [
      {
        id: "rename",
        title: "Rename",
        icon: "pencilSimple" as const,
        onClick: () => setEditingLayerNameId(layer.id),
      },
      {
        id: "delete",
        title: "Delete",
        icon: "trash" as const,
        onClick: () => handleLayerDelete(layer.id),
      },
    ],
    [layer.id, handleLayerDelete, setEditingLayerNameId],
  );

  const hoverActions: ReactNode[] | undefined = useMemo(
    () =>
      editingLayerNameId !== layer.id
        ? [
            !layer.isSketch && layer.visible && (
              <IconButton
                key="zoom"
                icon="crosshair"
                size="small"
                appearance="simple"
                onClick={handleZoomToLayer}
              />
            ),
            <IconButton
              key="visible"
              icon={layer.visible ? "eye" : "eyeSlash"}
              size="small"
              appearance="simple"
              onClick={handleToggleLayerVisibility}
            />,
          ]
        : undefined,
    [
      layer.id,
      layer.isSketch,
      layer.visible,
      editingLayerNameId,
      handleZoomToLayer,
      handleToggleLayerVisibility,
    ],
  );

  const handleTitleUpdate = useCallback(
    (title: string) => {
      setEditingLayerNameId("");
      if (!title || title === layer.title) return;
      handleLayerNameUpdate({ layerId: layer.id, name: title });
    },
    [layer.id, layer.title, handleLayerNameUpdate, setEditingLayerNameId],
  );

  return (
    <EntryItem
      title={
        editingLayerNameId === layer.id ? (
          <TextInput
            size="small"
            extendWidth
            autoFocus
            value={layer.title}
            onBlur={handleTitleUpdate}
          />
        ) : (
          <TitleWrapper onDoubleClick={() => setEditingLayerNameId(layer.id)}>
            {layer.title}
          </TitleWrapper>
        )
      }
      icon={layer?.isSketch ? "pencilSimple" : "file"}
      dragHandleClassName={dragHandleClassName}
      onClick={() => handleLayerSelect(layer.id)}
      highlight={layer.id === selectedLayerId}
      disableHover={isDragging}
      optionsMenu={optionsMenu}
      optionsMenuWidth={100}
      hoverActions={hoverActions}
    />
  );
};

export default LayerItem;

const TitleWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

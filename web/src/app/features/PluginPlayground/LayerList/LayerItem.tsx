import { IconButton } from "@reearth/app/lib/reearth-ui";
import { EntryItem, EntryItemAction } from "@reearth/app/ui/components";
import { Layer } from "@reearth/core";
import { FC, useCallback, useMemo } from "react";

interface LayerItemProps {
  handleLayerVisibilityUpdate: (layerId: string, visible: boolean) => void;
  layer: Layer;
  onFlyTo: (layerId: string, options: { duration: number }) => void;
  selectedLayerId: string;
  setSelectedLayerId: (layerId: string) => void;
}

const LayerItem: FC<LayerItemProps> = ({
  handleLayerVisibilityUpdate,
  layer,
  onFlyTo,
  selectedLayerId,
  setSelectedLayerId
}) => {
  const handleZoomToLayer = useCallback(() => {
    onFlyTo?.(layer.id, { duration: 0 });
  }, [onFlyTo, layer]);

  const handleToggleLayerVisibility = useCallback(() => {
    handleLayerVisibilityUpdate(layer.id, !layer.visible);
  }, [layer.id, layer.visible, handleLayerVisibilityUpdate]);

  const handleLayerItemClick = () => {
    setSelectedLayerId(layer.id);
  };

  const hoverActions: EntryItemAction[] | undefined = useMemo(
    () => [
      {
        comp: layer.visible && (
          <IconButton
            key="zoom"
            icon="crosshair"
            size="small"
            appearance="simple"
            onClick={handleZoomToLayer}
          />
        )
      },
      {
        comp: (
          <IconButton
            key="visible"
            icon={layer.visible ? "eye" : "eyeSlash"}
            size="small"
            appearance="simple"
            onClick={handleToggleLayerVisibility}
          />
        ),
        keepVisible: !layer.visible
      }
    ],
    [layer.visible, handleZoomToLayer, handleToggleLayerVisibility]
  );

  return (
    <EntryItem
      title={layer.title}
      icon="file"
      onClick={handleLayerItemClick}
      highlighted={layer.id === selectedLayerId}
      actions={hoverActions}
    />
  );
};

export default LayerItem;

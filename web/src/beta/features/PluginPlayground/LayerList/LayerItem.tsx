import { IconButton } from "@reearth/beta/lib/reearth-ui";
import { EntryItem, EntryItemAction } from "@reearth/beta/ui/components";
import { Layer } from "@reearth/core";
import { FC, useCallback, useMemo } from "react";

interface LayerItemProps {
  layer: Layer;
  onFlyTo: (layerId: string, options: { duration: number }) => void;
}

const LayerItem: FC<LayerItemProps> = ({ layer, onFlyTo }) => {
  const handleZoomToLayer = useCallback(() => {
    onFlyTo?.(layer.id, { duration: 0 });
    // issue: https://github.com/CesiumGS/cesium/issues/4327
    // delay 800ms to trigger a second flyTo,
    // time could be related with internet speed, not a stable solution
    // if (["geojson", "kml"].includes(layer.config?.data?.type)) {
    //   setTimeout(() => {
    //     handleFlyTo?.(layer.id, { duration: 0 });
    //   }, 800);
    // }
  }, [onFlyTo, layer]);

  // const handleToggleLayerVisibility = useCallback(() => {
  //   handleLayerVisibilityUpdate({ layerId: layer.id, visible: !layer.visible });
  // }, [layer.id, layer.visible, handleLayerVisibilityUpdate]);

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
            onClick={() => {}}
          />
        ),
        keepVisible: !layer.visible
      }
    ],
    [layer.visible, handleZoomToLayer]
  );

  return (
    <EntryItem
      title={layer.title}
      icon="file"
      //   onClick={handleLayerItemClick}
      // highlighted={layer.id === selectedLayerId}
      actions={hoverActions}
    />
  );
};

export default LayerItem;

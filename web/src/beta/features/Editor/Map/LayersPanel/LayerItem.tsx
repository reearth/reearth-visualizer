import {
  IconButton,
  PopupMenuItem,
  TextInput
} from "@reearth/beta/lib/reearth-ui";
import { EntryItem, EntryItemAction } from "@reearth/beta/ui/components";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

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
  setEditingLayerNameId
}) => {
  const t = useT();
  const {
    selectedLayerId,
    handleLayerSelect,
    handleLayerDelete,
    handleLayerNameUpdate,
    handleLayerVisibilityUpdate,
    handleFlyTo,
    openCustomPropertySchema,
    handleCustomPropertySchemaClick
  } = useMapPage();

  const handleZoomToLayer = useCallback(() => {
    handleFlyTo?.(layer.id, { duration: 0 });
    // issue: https://github.com/CesiumGS/cesium/issues/4327
    // delay 800ms to trigger a second flyTo,
    // time could be related with internet speed, not a stable solution
    if (["geojson", "kml"].includes(layer.config?.data?.type)) {
      setTimeout(() => {
        handleFlyTo?.(layer.id, { duration: 0 });
      }, 800);
    }
  }, [layer, handleFlyTo]);

  const handleToggleLayerVisibility = useCallback(() => {
    handleLayerVisibilityUpdate({ layerId: layer.id, visible: !layer.visible });
  }, [layer.id, layer.visible, handleLayerVisibilityUpdate]);

  const optionsMenu: PopupMenuItem[] = useMemo(() => {
    const menu = [
      {
        id: "rename",
        title: t("Rename"),
        icon: "pencilSimple" as const,
        onClick: () => setEditingLayerNameId(layer.id)
      },
      {
        id: "delete",
        title: t("Delete"),
        icon: "trash" as const,
        onClick: () => handleLayerDelete(layer.id)
      }
    ];

    const sketchMenu = layer.isSketch
      ? [
          {
            id: "customProperty",
            title: t("Property Schema"),
            icon: "listDashes" as const,
            onClick: () => {
              openCustomPropertySchema();
              handleCustomPropertySchemaClick?.(layer.id);
            }
          }
        ]
      : [];

    return [...sketchMenu, ...menu];
  }, [
    layer.isSketch,
    layer.id,
    setEditingLayerNameId,
    handleLayerDelete,
    openCustomPropertySchema,
    handleCustomPropertySchemaClick,
    t
  ]);

  const hoverActions: EntryItemAction[] | undefined = useMemo(
    () =>
      editingLayerNameId !== layer.id
        ? [
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
          ]
        : undefined,
    [
      layer.id,
      layer.visible,
      editingLayerNameId,
      handleZoomToLayer,
      handleToggleLayerVisibility
    ]
  );

  const [localTitle, setLocalTitle] = useState(layer.title);

  const handleTitleUpdate = useCallback(() => {
    setEditingLayerNameId("");
    if (!localTitle || localTitle === layer.title) return;
    handleLayerNameUpdate({ layerId: layer.id, name: localTitle });
  }, [
    layer.id,
    layer.title,
    localTitle,
    handleLayerNameUpdate,
    setEditingLayerNameId
  ]);

  const handleLayerItemClick = useCallback(() => {
    if (layer.id === selectedLayerId) return;
    handleLayerSelect(layer.id);
    setEditingLayerNameId("");
  }, [layer.id, selectedLayerId, handleLayerSelect, setEditingLayerNameId]);

  useEffect(() => {
    setLocalTitle(layer.title);
  }, [layer.title]);

  const handleTitleUpdateRef = useRef(handleTitleUpdate);
  handleTitleUpdateRef.current = handleTitleUpdate;

  useEffect(() => {
    if (selectedLayerId !== layer.id) {
      handleTitleUpdateRef.current();
    }
  }, [selectedLayerId, layer.id, handleTitleUpdateRef]);

  return (
    <EntryItem
      title={
        editingLayerNameId === layer.id ? (
          <TextInput
            size="small"
            extendWidth
            autoFocus
            value={localTitle}
            onChange={setLocalTitle}
            onBlur={handleTitleUpdate}
          />
        ) : (
          <TitleWrapper onDoubleClick={() => setEditingLayerNameId(layer.id)}>
            {localTitle}
          </TitleWrapper>
        )
      }
      icon={layer?.isSketch ? "pencilSimple" : "file"}
      dragHandleClassName={dragHandleClassName}
      onClick={handleLayerItemClick}
      highlighted={layer.id === selectedLayerId}
      disableHover={isDragging}
      optionsMenu={optionsMenu}
      optionsMenuWidth={150}
      actions={hoverActions}
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
  whiteSpace: "nowrap"
}));

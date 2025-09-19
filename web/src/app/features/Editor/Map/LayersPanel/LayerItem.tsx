import {
  Button,
  IconButton,
  PopupMenuItem,
  TextInput
} from "@reearth/app/lib/reearth-ui";
import { EntryItem, EntryItemAction } from "@reearth/app/ui/components";
import ConfirmModal from "@reearth/app/ui/components/ConfirmModal";
import type { NLSLayer } from "@reearth/services/api/layer";
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
    handleFlyTo
  } = useMapPage();

  const [showDeleteLayerConfirmModal, setShowDeleteLayerConfirmModal] =
    useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleZoomToLayer = useCallback(() => {
    handleFlyTo?.(layer.id, { duration: 0 });
    // issue: https://github.com/CesiumGS/cesium/issues/4327
    // delay 800ms to trigger a second flyTo,
    // time could be related with internet speed, not a stable solution
    if (["geojson", "kml"].includes(layer.config?.data?.type)) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        handleFlyTo?.(layer.id, { duration: 0 });
        timeoutRef.current = null;
      }, 800);
    }
  }, [layer, handleFlyTo]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleToggleLayerVisibility = useCallback(() => {
    handleLayerVisibilityUpdate({ layerId: layer.id, visible: !layer.visible });
  }, [layer.id, layer.visible, handleLayerVisibilityUpdate]);

  const optionsMenu: PopupMenuItem[] = [
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
      onClick: () => setShowDeleteLayerConfirmModal(true)
    }
  ];

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
                  tooltipText={t("Fly to")}
                  placement="top"
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
                  placement="top"
                  tooltipText={t("Visibility")}
                  onClick={handleToggleLayerVisibility}
                />
              ),
              keepVisible: !layer.visible
            }
          ]
        : undefined,
    [
      editingLayerNameId,
      layer.id,
      layer.visible,
      t,
      handleZoomToLayer,
      handleToggleLayerVisibility
    ]
  );

  const [localTitle, setLocalTitle] = useState(layer.title);

  const handleTitleUpdate = useCallback(() => {
    setEditingLayerNameId("");
    if (!localTitle || localTitle === layer.title) {
      setLocalTitle(layer.title);
    } else handleLayerNameUpdate({ layerId: layer.id, name: localTitle });
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
    <>
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
        dataTestid="layer-item"
      />
      {showDeleteLayerConfirmModal && (
        <ConfirmModal
          visible={true}
          title={t("Delete this Layer?")}
          description={t(
            "Are you sure you want to remove this Layer? If deleted, all data of this layer will be lost and you can not recover it again."
          )}
          actions={
            <>
              <Button
                size="normal"
                title={t("Cancel")}
                onClick={() => setShowDeleteLayerConfirmModal(false)}
              />
              <Button
                size="normal"
                title={t("Delete")}
                appearance="dangerous"
                onClick={() => handleLayerDelete(layer.id)}
              />
            </>
          }
        />
      )}
    </>
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

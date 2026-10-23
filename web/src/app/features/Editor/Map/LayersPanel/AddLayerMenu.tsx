import { Button, PopupMenu, PopupMenuItem } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";

import { useMapPage } from "../context";
import {
  showDataSourceLayerCreatorAtom,
  showPlateauAssetLayerCreatorAtom,
  showSketchLayerCreatorAtom,
  showUrlLayerCreatorAtom,
  showValueLayerCreatorAtom
} from "../state";

const AddLayerMenu = () => {
  const t = useT();
  const { sceneId, handleLayerAdd } = useMapPage();

  // Presets need no input, so they are added straight from the menu. Google
  // Photorealistic always uses the Re:Earth provider (no Cesium Ion token).
  const addPreset = useCallback(
    (type: "reearth-buildings" | "google-photorealistic") => {
      if (!sceneId) return;
      const isGoogle = type === "google-photorealistic";
      handleLayerAdd({
        layerType: "simple",
        sceneId,
        title: isGoogle
          ? t("Google Photorealistic 3D Tiles")
          : t("Re:Earth Buildings"),
        visible: true,
        config: { data: { type, ...(isGoogle && { provider: "reearth" }) } }
      });
    },
    [handleLayerAdd, sceneId, t]
  );

  const setShowDataSourceLayerCreator = useSetAtom(
    showDataSourceLayerCreatorAtom
  );
  const openDataSourceLayerCreator = useCallback(() => {
    setShowDataSourceLayerCreator(true);
  }, [setShowDataSourceLayerCreator]);

  const setShowSketchLayerCreator = useSetAtom(showSketchLayerCreatorAtom);
  const openSketchLayerCreator = useCallback(() => {
    setShowSketchLayerCreator(true);
  }, [setShowSketchLayerCreator]);

  const setShowPlateauAssetLayerCreator = useSetAtom(
    showPlateauAssetLayerCreatorAtom
  );
  const openPlateauAssetLayerCreator = useCallback(() => {
    setShowPlateauAssetLayerCreator(true);
  }, [setShowPlateauAssetLayerCreator]);

  const setShowUrlLayerCreator = useSetAtom(showUrlLayerCreatorAtom);
  const openUrlLayerCreator = useCallback(() => {
    setShowUrlLayerCreator(true);
  }, [setShowUrlLayerCreator]);

  const setShowValueLayerCreator = useSetAtom(showValueLayerCreatorAtom);
  const openValueLayerCreator = useCallback(() => {
    setShowValueLayerCreator(true);
  }, [setShowValueLayerCreator]);

  // TODO: "Add from Assets" still opens the data source manager; point it at
  // its dedicated flow once built.
  const newLayerMenu: PopupMenuItem[] = useMemo(
    () => [
      {
        id: "add-from-assets",
        title: t("Add from Assets"),
        description: t("Upload new files or pick existing ones"),
        icon: "floppyDisk",
        onClick: openDataSourceLayerCreator
      },
      {
        id: "add-from-url",
        title: t("Add from URL"),
        description: t("Link to externally hosted data"),
        icon: "linkSimple",
        onClick: openUrlLayerCreator
      },
      {
        id: "add-from-value",
        title: t("Add from Value"),
        description: t("Enter data or coordinates manually"),
        icon: "pencilSimple",
        onClick: openValueLayerCreator
      },
      {
        id: "add-plateau-asset-layer",
        title: t("Add layer from PLATEAU"),
        description: t("Browse PLATEAU open data"),
        icon: "plateau",
        onClick: openPlateauAssetLayerCreator
      },
      {
        id: "add-sketch-layer",
        title: t("Create Sketch Layer"),
        description: t("Draw shapes and markers on the map"),
        icon: "polygon",
        onClick: openSketchLayerCreator
      },
      {
        id: "preset-3d-tiles",
        title: t("Preset 3D Tiles"),
        icon: "cube",
        subItem: [
          {
            id: "preset-reearth-buildings",
            title: t("Re:Earth Buildings"),
            description: t("Open 3D buildings worldwide"),
            onClick: () => addPreset("reearth-buildings")
          },
          {
            id: "preset-google-photorealistic",
            title: t("Google Photorealistic 3D Tiles"),
            description: t("Photorealistic 3D mesh of the world"),
            onClick: () => addPreset("google-photorealistic")
          }
        ]
      }
    ],
    [
      addPreset,
      openDataSourceLayerCreator,
      openUrlLayerCreator,
      openValueLayerCreator,
      openSketchLayerCreator,
      openPlateauAssetLayerCreator,
      t
    ]
  );

  return (
    <PopupMenu
      label={
        <Button
          icon="plus"
          title={t("New Layer")}
          size="small"
          extendWidth
          data-testid="new-layer-button"
        />
      }
      extendTriggerWidth
      extendContentWidth
      placement="bottom-end"
      menu={newLayerMenu}
      maxHeight={400}
      width={200}
      data-testid="new-layer-menu"
    />
  );
};

export default AddLayerMenu;

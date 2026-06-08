import { DeviceType } from "@reearth/app/utils/device";
import { Camera } from "@reearth/app/utils/value";
import { useAtom } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";

import {
  expandedPlateauFolderIds,
  selectedPlateauDatasetId,
  selectedPlateauDatasetItem
} from "./Map/PlateauAssetLayerCreator/atoms";

const currentCamera = atomWithReset<Camera | undefined>(undefined);
export const useCurrentCamera = () => useAtom(currentCamera);

// Widgets View
const widgetsViewDevice = atomWithReset<DeviceType>("desktop");
export const useWidgetsViewDevice = () => useAtom(widgetsViewDevice);

// Publish View
const publishViewDevice = atomWithReset<DeviceType>("desktop");
export const usePublishViewDevice = () => useAtom(publishViewDevice);

// Cesium Ion Access Token
// Extracted from scene property (Main settings -> default group -> ion field)
// Used by PropertyField and other components that need to check token availability
const cesiumIonAccessToken = atomWithReset<string | undefined>(undefined);
export const useCesiumIonAccessToken = () => useAtom(cesiumIonAccessToken);

// Scene Setting Navigation Target
// Used to trigger navigation to a specific scene setting (e.g., "main", "tiles", "terrain")
// When set, the InspectorPanel will navigate to the specified scene setting and clear the atom
const sceneSettingNavigationTarget = atomWithReset<string | undefined>(undefined);
export const useSceneSettingNavigationTarget = () => useAtom(sceneSettingNavigationTarget);

// Reset all
export const useResetAllAtoms = () => {
  const resetCurrentCamera = useResetAtom(currentCamera);
  const resetWidgetsViewDevice = useResetAtom(widgetsViewDevice);
  const resetPublishViewDevice = useResetAtom(publishViewDevice);
  const resetCesiumIonAccessToken = useResetAtom(cesiumIonAccessToken);
  const resetSceneSettingNavigationTarget = useResetAtom(sceneSettingNavigationTarget);

  const resetPlateauExpendedFolderIds = useResetAtom(expandedPlateauFolderIds);
  const resetPlateauSelectedDatasetId = useResetAtom(selectedPlateauDatasetId);
  const resetPlateauSelectedDatasetItem = useResetAtom(
    selectedPlateauDatasetItem
  );

  return () => {
    resetCurrentCamera();
    resetWidgetsViewDevice();
    resetPublishViewDevice();
    resetCesiumIonAccessToken();
    resetSceneSettingNavigationTarget();
    resetPlateauExpendedFolderIds();
    resetPlateauSelectedDatasetId();
    resetPlateauSelectedDatasetItem();
  };
};

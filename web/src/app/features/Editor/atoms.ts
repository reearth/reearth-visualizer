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

// Reset all
export const useResetAllAtoms = () => {
  const resetCurrentCamera = useResetAtom(currentCamera);
  const resetWidgetsViewDevice = useResetAtom(widgetsViewDevice);
  const resetPublishViewDevice = useResetAtom(publishViewDevice);

  const resetPlateauExpendedFolderIds = useResetAtom(expandedPlateauFolderIds);
  const resetPlateauSelectedDatasetId = useResetAtom(selectedPlateauDatasetId);
  const resetPlateauSelectedDatasetItem = useResetAtom(
    selectedPlateauDatasetItem
  );

  return () => {
    resetCurrentCamera();
    resetWidgetsViewDevice();
    resetPublishViewDevice();
    resetPlateauExpendedFolderIds();
    resetPlateauSelectedDatasetId();
    resetPlateauSelectedDatasetItem();
  };
};

import { Camera } from "@reearth/app/utils/value";
import { useAtom } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";

const currentCamera = atomWithReset<Camera | undefined>(undefined);
export const useCurrentCamera = () => useAtom(currentCamera);

// Widgets View
export type DeviceType = "desktop" | "mobile";
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

  return () => {
    resetCurrentCamera();
    resetWidgetsViewDevice();
    resetPublishViewDevice();
  };
};

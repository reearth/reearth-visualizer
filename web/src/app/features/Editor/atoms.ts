import { Camera } from "@reearth/app/utils/value";
import { useAtom } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";

const currentCamera = atomWithReset<Camera | undefined>(undefined);
export const useCurrentCamera = () => useAtom(currentCamera);

// Widgets Tab
const device = atomWithReset<"desktop" | "mobile">("desktop");
export const useDevice = () => useAtom(device);

// Reset all
export const useResetAllAtoms = () => {
  const resetCurrentCamera = useResetAtom(currentCamera);
  const resetDevice = useResetAtom(device);

  return () => {
    resetCurrentCamera();
    resetDevice();
  };
};

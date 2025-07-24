import { Camera } from "@reearth/app/utils/value";
import { atom, useAtom } from "jotai";

const currentCamera = atom<Camera | undefined>(undefined);
export const useCurrentCamera = () => useAtom(currentCamera);

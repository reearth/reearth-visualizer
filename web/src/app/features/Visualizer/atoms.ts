import { Camera } from "@reearth/app/utils/value";
import { atom, useAtom } from "jotai";

const visualizerCamera = atom<Camera | undefined>(undefined);
export const useVisualizerCamera = () => useAtom(visualizerCamera);

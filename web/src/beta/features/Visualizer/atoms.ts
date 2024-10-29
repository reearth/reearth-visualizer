import { Camera } from "@reearth/beta/utils/value";
import { atom, useAtom } from "jotai";

const visualizerCamera = atom<Camera | undefined>(undefined);
export const useVisualizerCamera = () => useAtom(visualizerCamera);

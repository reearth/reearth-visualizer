import { atom, useAtom } from "jotai";

import { Camera } from "@reearth/beta/utils/value";

const visualizerCamera = atom<Camera | undefined>(undefined);
export const useVisualizerCamera = () => useAtom(visualizerCamera);

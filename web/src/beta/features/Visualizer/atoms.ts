import { Camera } from "@reearth/beta/utils/value";
import { Credit } from "@reearth/core";
import { atom, useAtom } from "jotai";

const visualizerCamera = atom<Camera | undefined>(undefined);
export const useVisualizerCamera = () => useAtom(visualizerCamera);

const visualizerCredits = atom<Credit[]>([]);
export const useVisualizerCredits = () => useAtom(visualizerCredits);

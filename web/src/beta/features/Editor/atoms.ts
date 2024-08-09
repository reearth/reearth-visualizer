import { atom, useAtom } from "jotai";

import { Camera } from "@reearth/beta/utils/value";

const currentCamera = atom<Camera | undefined>(undefined);
export const useCurrentCamera = () => useAtom(currentCamera);

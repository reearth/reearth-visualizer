import { atom, useAtom } from "jotai";

const devPluginExtensionRenderKey = atom<number>(0);
export const useDevPluginExtensionRenderKey = () =>
  useAtom(devPluginExtensionRenderKey);

const devPluginExtensions = atom<{ id: string; url: string }[] | undefined>(
  undefined,
);
export const useDevPluginExtensions = () => useAtom(devPluginExtensions);

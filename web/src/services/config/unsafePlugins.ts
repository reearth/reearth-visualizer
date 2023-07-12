export type UnsafePlugin = {
  id: string;
  name: string;
  widgets: UnsafeWidget[];
  blocks: UnsafeBlock[];
};

type UnsafeWidget = PluginExtension<"widget">;

type UnsafeBlock = PluginExtension<"block">;

type PluginExtension<T extends "widget" | "block"> = {
  type: T;
  id: string;
  name: string;
  component: React.FC;
};

export async function loadUnsafePlugins(urls?: string[]): Promise<UnsafePlugin[] | undefined> {
  if (!urls) return undefined;

  const unsafePlugins: UnsafePlugin[] = [];
  console.log("URLS: ", urls);

  for (const url of urls) {
    try {
      const newUnsafePlugins: UnsafePlugin[] = (await import(/* @vite-ignore */ url)).default;
      console.log("newUnsafePlugins", newUnsafePlugins);
      newUnsafePlugins.forEach(plugin => {
        unsafePlugins.push(plugin as UnsafePlugin);
      });

      console.log("newUnsafePlugins", newUnsafePlugins);

      // newExtensions.forEach(ext => {
      //   if (ext.type === "dataset-import") datasetImport.push(ext as Extension<"dataset-import">);
      //   else if (ext.type === "publication") publication.push(ext as Extension<"publication">);
      //   else if (ext.type === "plugin-library")
      //     pluginLibrary.push(ext as Extension<"plugin-library">);
      //   else if (ext.type === "plugin-installed")
      //     pluginInstalled.push(ext as Extension<"plugin-installed">);
      //   else if (ext.type === "global-modal") globalModal.push(ext as Extension<"global-modal">);
      // });
    } catch (e) {
      console.error("unsafe plugin load failed", e);
    }
  }
  console.log("unsafePlugins", unsafePlugins);

  return unsafePlugins;
}

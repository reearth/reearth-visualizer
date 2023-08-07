import { UnsafeBuiltinPlugin } from "./types";

export const loadPlugins = async () => {
  const urls = window.REEARTH_CONFIG?.unsafePluginUrls;
  return urls
    ? (
        await Promise.all(
          urls.map(async url => {
            try {
              const plugin: UnsafeBuiltinPlugin = (await import(/* @vite-ignore */ url)).default;
              console.log("Hello", plugin);
              return plugin;
            } catch (e) {
              throw new Error(`Specified unsafe built-in module could not find: ${url} ${e}`);
            }
          }),
        )
      ).filter(Boolean)
    : [];
};

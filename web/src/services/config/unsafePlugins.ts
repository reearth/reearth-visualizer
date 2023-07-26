export type UnsafeBuiltinPlugin = {
  id: string;
  name: string;
  widgets: UnsafeWidget[];
  blocks: UnsafeBlock[];
};

type UnsafeWidget = PluginExtension<"widget">;

type UnsafeBlock = PluginExtension<"block">;

type PluginExtension<T extends "widget" | "block"> = {
  type: T;
  extensionId: string;
  name: string;
  component: React.FC;
};

export async function loadUnsafeBuiltinPlugins(
  urls?: string[],
): Promise<UnsafeBuiltinPlugin[] | undefined> {
  if (!urls) return undefined;

  const unsafePlugins: UnsafeBuiltinPlugin[] = [];

  for (const url of urls) {
    try {
      const newUnsafePlugins: UnsafeBuiltinPlugin[] = (await import(/* @vite-ignore */ url))
        .default;
      newUnsafePlugins.forEach(plugin => {
        unsafePlugins.push(plugin as UnsafeBuiltinPlugin);
      });
    } catch (e) {
      console.error("unsafe plugin load failed", e);
    }
  }

  return unsafePlugins;
}

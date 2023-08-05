export type UnsafeBuiltinPlugin = {
  id: string;
  name: string;
  widgets: UnsafeBuiltinWidget[];
  blocks: UnsafeBuiltinBlock[];
};

type UnsafeBuiltinWidget = UnsafeBuiltinPluginExtension<"widget">;

type UnsafeBuiltinBlock = UnsafeBuiltinPluginExtension<"block">;

type UnsafeBuiltinPluginExtension<T extends "widget" | "block"> = {
  type: T;
  extensionId: string;
  name: string;
  component: React.FC;
};

export type UnsafeBuiltinWidgets<T = unknown> = Record<string, T>;

export async function loadUnsafeBuiltinPlugins() {
  try {
    const unsafeBuiltinPlugins = (
      await import(/* @vite-ignore */ "src/beta/lib/unsafeBuiltinPlugins")
    ).default as UnsafeBuiltinPlugin[];
    return unsafeBuiltinPlugins;
  } catch (e) {
    console.error("unsafe builtin plugin load failed", e);
  }
  return undefined;
}

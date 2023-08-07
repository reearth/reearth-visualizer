import type { UnsafeBuiltinPlugin } from "../../beta/lib/unsafeBuiltinPlugins";

export type { UnsafeBuiltinPlugin } from "../../beta/lib/unsafeBuiltinPlugins";

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

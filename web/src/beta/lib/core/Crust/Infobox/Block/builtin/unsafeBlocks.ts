import { merge } from "lodash-es";

import { Component } from "..";
import { UnsafeBuiltinPlugin } from "../../../types";

export type UnsafeBuiltinBlocks<T = unknown> = Record<string, T>;

const unsafeBuiltinPlugins = (await import("src/beta/lib/unsafeBuiltinPlugins")).default;

export const unsafeBuiltinBlocks = processUnsafeBuiltinBlocks(unsafeBuiltinPlugins);

function processUnsafeBuiltinBlocks(plugin?: UnsafeBuiltinPlugin[]) {
  if (!plugin) return;

  const unsafeBlocks: UnsafeBuiltinBlocks<Component> | undefined = plugin
    .map(p =>
      p.widgets.map(w => {
        return {
          widgetId: `${p.id}/${w.extensionId}`,
          ...w,
        };
      }),
    )
    .reduce((a, b) => {
      const newObject: { [key: string]: Component } = {};
      b.forEach(w => {
        newObject[w.widgetId] = w.component;
      });
      return merge(a, newObject);
    }, {});

  return unsafeBlocks;
}

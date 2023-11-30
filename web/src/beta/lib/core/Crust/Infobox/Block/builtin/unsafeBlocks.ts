import { merge } from "lodash-es";

import { config } from "@reearth/services/config";
import { type UnsafeBuiltinPlugin } from "@reearth/services/config/unsafeBuiltinPlugin";

import { Component } from "..";

export type UnsafeBuiltinBlocks<T = unknown> = Record<string, T>;

export const unsafeBuiltinBlocks = () => processUnsafeBuiltinBlocks(config()?.unsafeBuiltinPlugins);

function processUnsafeBuiltinBlocks(plugin?: UnsafeBuiltinPlugin[]) {
  if (!plugin) return;

  const unsafeBlocks: UnsafeBuiltinBlocks<Component> | undefined = plugin
    .map(p =>
      p.blocks?.map(w => {
        return {
          widgetId: `${p.id}/${w.extensionId}`,
          ...w,
        };
      }),
    )
    .reduce((a, b) => {
      const newObject: { [key: string]: Component } = {};
      b?.forEach(w => {
        newObject[w.widgetId] = w.component;
      });
      return merge(a, newObject);
    }, {});

  return unsafeBlocks || [];
}

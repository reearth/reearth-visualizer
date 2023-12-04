import { merge } from "lodash-es";

import { config } from "@reearth/services/config";
import { type UnsafeBuiltinPlugin } from "@reearth/services/config/unsafeBuiltinPlugin";

import type { Component } from "..";

export type { Component } from "..";

export type UnsafeBuiltinWidgets<T = unknown> = Record<string, T>;

export const unsafeBuiltinWidgets = () =>
  processUnsafeBuiltinWidgets(config()?.unsafeBuiltinPlugins);

function processUnsafeBuiltinWidgets(plugin?: UnsafeBuiltinPlugin[]) {
  if (!plugin) return;

  const unsafeWidgets: UnsafeBuiltinWidgets<Component> | undefined = plugin
    .map(p =>
      p.widgets?.map(w => {
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

  return unsafeWidgets || [];
}

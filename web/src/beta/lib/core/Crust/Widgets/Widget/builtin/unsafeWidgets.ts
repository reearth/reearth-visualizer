import { merge } from "lodash-es";

import type { Component } from "..";

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

export type { Component } from "..";

export type UnsafeBuiltinWidgets<T = unknown> = Record<string, T>;

const unsafeBuiltinPlugins = (
  await import(/* @vite-ignore */ "@reearth/beta/lib/unsafeBuiltinPlugins")
).default;

export const unsafeBuiltinWidgets = processUnsafeBuiltinWidgets(unsafeBuiltinPlugins);

function processUnsafeBuiltinWidgets(plugin?: UnsafeBuiltinPlugin[]) {
  if (!plugin) return;

  const unsafeWidgets: UnsafeBuiltinWidgets<Component> | undefined = plugin
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

  return unsafeWidgets;
}

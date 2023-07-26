import { merge } from "lodash-es";

import { config } from "@reearth/services/config";
import { UnsafeBuiltinPlugin } from "@reearth/services/config/unsafePlugins";

import Button from "./Button";
import Menu from "./LegacyMenu";
import Navigator from "./Navigator";
import SplashScreen from "./SplashScreen";
import Storytelling from "./Storytelling";
import Timeline from "./Timeline";

import type { Component } from ".";

export const MENU_BUILTIN_WIDGET_ID = "reearth/menu"; // legacy
export const BUTTON_BUILTIN_WIDGET_ID = "reearth/button";
export const SPLASHSCREEN_BUILTIN_WIDGET_ID = "reearth/splashscreen";
export const STORYTELLING_BUILTIN_WIDGET_ID = "reearth/storytelling";
export const TIMELINE_BUILTIN_WIDGET_ID = "reearth/timeline";
export const NAVIGATOR_BUILTIN_WIDGET_ID = "reearth/navigator";

export type BuiltinWidgets<T = unknown> = Record<
  | typeof MENU_BUILTIN_WIDGET_ID
  | typeof BUTTON_BUILTIN_WIDGET_ID
  | typeof SPLASHSCREEN_BUILTIN_WIDGET_ID
  | typeof STORYTELLING_BUILTIN_WIDGET_ID
  | typeof TIMELINE_BUILTIN_WIDGET_ID
  | typeof NAVIGATOR_BUILTIN_WIDGET_ID,
  T
>;

export type UnsafeBuiltinWidgets<T = unknown> = Record<string, T>;

const reearthConfig = config();

const BUILTIN_WIDGET_OPTIONS: BuiltinWidgets<{ animation?: boolean }> = {
  [MENU_BUILTIN_WIDGET_ID]: {},
  [BUTTON_BUILTIN_WIDGET_ID]: {},
  [SPLASHSCREEN_BUILTIN_WIDGET_ID]: {},
  [STORYTELLING_BUILTIN_WIDGET_ID]: {},
  [TIMELINE_BUILTIN_WIDGET_ID]: {
    animation: true,
  },
  [NAVIGATOR_BUILTIN_WIDGET_ID]: {
    animation: true,
  },
};

export const getBuiltinWidgetOptions = (id: string) =>
  BUILTIN_WIDGET_OPTIONS[id as keyof BuiltinWidgets];

const builtin: BuiltinWidgets<Component> = {
  [MENU_BUILTIN_WIDGET_ID]: Menu,
  [BUTTON_BUILTIN_WIDGET_ID]: Button,
  [SPLASHSCREEN_BUILTIN_WIDGET_ID]: SplashScreen,
  [STORYTELLING_BUILTIN_WIDGET_ID]: Storytelling,
  [TIMELINE_BUILTIN_WIDGET_ID]: Timeline,
  [NAVIGATOR_BUILTIN_WIDGET_ID]: Navigator,
};

const unsafeBuiltinPlugins = config()?.unsafeBuiltinPlugins;

const unsafeBuiltinWidgets: UnsafeBuiltinWidgets<Component> | undefined =
  processUnsafeBuiltinWidgets(unsafeBuiltinPlugins);

const localUnsafeBuiltinWidgets = reearthConfig?.unsafeBuiltinPluginDevUrl
  ? {
      [(await import(/* @vite-ignore */ reearthConfig?.unsafeBuiltinPluginDevUrl)).widgetId]: (
        await import(/* @vite-ignore */ reearthConfig?.unsafeBuiltinPluginDevUrl)
      ).default,
    }
  : undefined;

merge(builtin, unsafeBuiltinWidgets, localUnsafeBuiltinWidgets);

export const isBuiltinWidget = (id: string): id is keyof BuiltinWidgets => {
  return !!builtin[id as keyof BuiltinWidgets];
};

export default builtin;

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

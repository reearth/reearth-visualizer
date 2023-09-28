import { merge } from "lodash-es";

import Button from "./Button";
import Navigator from "./Navigator";
import Timeline from "./Timeline";
import { Component, unsafeBuiltinWidgets, type UnsafeBuiltinWidgets } from "./unsafeWidgets";

export const BUTTON_BUILTIN_WIDGET_ID = "reearth/button";
export const TIMELINE_BUILTIN_WIDGET_ID = "reearth/timeline";
export const NAVIGATOR_BUILTIN_WIDGET_ID = "reearth/navigator";

export type ReEarthBuiltinWidgets<T = unknown> = Record<
  | typeof BUTTON_BUILTIN_WIDGET_ID
  | typeof TIMELINE_BUILTIN_WIDGET_ID
  | typeof NAVIGATOR_BUILTIN_WIDGET_ID,
  T
>;

export type BuiltinWidgets<T = unknown> = ReEarthBuiltinWidgets<T> & UnsafeBuiltinWidgets<T>;

const REEARTH_BUILTIN_WIDGET_OPTIONS: BuiltinWidgets<{ animation?: boolean }> = {
  [BUTTON_BUILTIN_WIDGET_ID]: {},
  [TIMELINE_BUILTIN_WIDGET_ID]: {
    animation: true,
  },
  [NAVIGATOR_BUILTIN_WIDGET_ID]: {
    animation: true,
  },
};

const BUILTIN_WIDGET_OPTIONS: BuiltinWidgets<{ animation?: boolean }> =
  REEARTH_BUILTIN_WIDGET_OPTIONS;

Object.keys(unsafeBuiltinWidgets ?? {}).map(uw => {
  BUILTIN_WIDGET_OPTIONS[uw] = {};
});

const reearthBuiltin: BuiltinWidgets<Component> = {
  [BUTTON_BUILTIN_WIDGET_ID]: Button,
  [TIMELINE_BUILTIN_WIDGET_ID]: Timeline,
  [NAVIGATOR_BUILTIN_WIDGET_ID]: Navigator,
};

const builtin = merge({}, reearthBuiltin, unsafeBuiltinWidgets);

export const getBuiltinWidgetOptions = (id: string) =>
  BUILTIN_WIDGET_OPTIONS[id as keyof BuiltinWidgets];

export const isBuiltinWidget = (id: string): id is keyof BuiltinWidgets => {
  return !!builtin[id as keyof BuiltinWidgets];
};

export default builtin;

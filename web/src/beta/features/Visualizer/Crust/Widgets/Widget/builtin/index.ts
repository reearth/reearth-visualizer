import { merge } from "lodash-es";

import {
  BUTTON_BUILTIN_WIDGET_ID,
  NAVIGATOR_BUILTIN_WIDGET_ID,
} from "@reearth/services/api/widgetsApi/utils";
import { config } from "@reearth/services/config";

import Button from "./Button";
import Navigator from "./Navigator";
// import Timeline from "./Timeline";
import { Component, unsafeBuiltinWidgets, type UnsafeBuiltinWidgets } from "./unsafeWidgets";

export type ReEarthBuiltinWidgets<T = unknown> = Record<
  | typeof BUTTON_BUILTIN_WIDGET_ID
  // | typeof TIMELINE_BUILTIN_WIDGET_ID
  | typeof NAVIGATOR_BUILTIN_WIDGET_ID,
  T
>;

export type BuiltinWidgets<T = unknown> = ReEarthBuiltinWidgets<T> & UnsafeBuiltinWidgets<T>;

const REEARTH_BUILTIN_WIDGET_OPTIONS: BuiltinWidgets<{ animation?: boolean }> = {
  [BUTTON_BUILTIN_WIDGET_ID]: {},
  // [TIMELINE_BUILTIN_WIDGET_ID]: {
  //   animation: true,
  // },
  [NAVIGATOR_BUILTIN_WIDGET_ID]: {
    animation: true,
  },
};

const BUILTIN_WIDGET_OPTIONS: BuiltinWidgets<{ animation?: boolean }> =
  REEARTH_BUILTIN_WIDGET_OPTIONS;

const reearthBuiltin: BuiltinWidgets<Component> = {
  [BUTTON_BUILTIN_WIDGET_ID]: Button,
  // [TIMELINE_BUILTIN_WIDGET_ID]: Timeline,
  [NAVIGATOR_BUILTIN_WIDGET_ID]: Navigator,
};

let cachedBuiltin:
  | (ReEarthBuiltinWidgets<Component> & UnsafeBuiltinWidgets<Component>)
  | undefined = undefined;
const builtin = () => {
  if (cachedBuiltin) return cachedBuiltin;
  if (config()) {
    cachedBuiltin = merge({}, reearthBuiltin, unsafeBuiltinWidgets());
    return cachedBuiltin;
  } else {
    return reearthBuiltin;
  }
};

export const getBuiltinWidgetOptions = (id: string) => {
  Object.keys(unsafeBuiltinWidgets() ?? {}).map(uw => {
    BUILTIN_WIDGET_OPTIONS[uw] = {};
  });
  return BUILTIN_WIDGET_OPTIONS[id as keyof BuiltinWidgets];
};

export const isBuiltinWidget = (id: string): id is keyof BuiltinWidgets => {
  return !!builtin()[id as keyof BuiltinWidgets];
};

export default builtin;

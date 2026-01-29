import {
  BUTTON_BUILTIN_WIDGET_ID,
  DATA_ATTRIBUTION_WIDGET_ID,
  GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID,
  GOOGLE_MAP_STREET_VIEW_WIDGET_ID,
  NAVIGATOR_BUILTIN_WIDGET_ID,
  TIMELINE_BUILTIN_WIDGET_ID
} from "@reearth/services/api/widget/utils";
import { config } from "@reearth/services/config";
import { merge } from "lodash-es";

import Button from "./Button";
import DataAttribution from "./DataAttribution";
import GoogleMapSearch from "./GoogleMapSearch";
import GoogleStreetView from "./GoogleStreetView";
import Navigator from "./Navigator";
import Timeline from "./Timeline";
import {
  Component,
  unsafeBuiltinWidgets,
  type UnsafeBuiltinWidgets
} from "./unsafeWidgets";

export type ReEarthBuiltinWidgets<T = unknown> = Record<
  | typeof BUTTON_BUILTIN_WIDGET_ID
  | typeof NAVIGATOR_BUILTIN_WIDGET_ID
  | typeof DATA_ATTRIBUTION_WIDGET_ID
  | typeof GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID
  | typeof TIMELINE_BUILTIN_WIDGET_ID
  | typeof GOOGLE_MAP_STREET_VIEW_WIDGET_ID,
  T
>;

export type BuiltinWidgets<T = unknown> = ReEarthBuiltinWidgets<T> &
  UnsafeBuiltinWidgets<T>;

const REEARTH_BUILTIN_WIDGET_OPTIONS: BuiltinWidgets<{ animation?: boolean }> =
  {
    [BUTTON_BUILTIN_WIDGET_ID]: {},
    [NAVIGATOR_BUILTIN_WIDGET_ID]: {
      animation: true
    },
    [DATA_ATTRIBUTION_WIDGET_ID]: {},
    [GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID]: {},
    [TIMELINE_BUILTIN_WIDGET_ID]: {},
    [GOOGLE_MAP_STREET_VIEW_WIDGET_ID]: {}
  };

const BUILTIN_WIDGET_OPTIONS: BuiltinWidgets<{ animation?: boolean }> =
  REEARTH_BUILTIN_WIDGET_OPTIONS;

const reearthBuiltin: BuiltinWidgets<Component> = {
  [BUTTON_BUILTIN_WIDGET_ID]: Button,
  [NAVIGATOR_BUILTIN_WIDGET_ID]: Navigator,
  [DATA_ATTRIBUTION_WIDGET_ID]: DataAttribution,
  [GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID]: GoogleMapSearch,
  [TIMELINE_BUILTIN_WIDGET_ID]: Timeline,
  [GOOGLE_MAP_STREET_VIEW_WIDGET_ID]: GoogleStreetView
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
  Object.keys(unsafeBuiltinWidgets() ?? {}).map((uw) => {
    BUILTIN_WIDGET_OPTIONS[uw] = {};
  });
  return BUILTIN_WIDGET_OPTIONS[id as keyof BuiltinWidgets];
};

export const isBuiltinWidget = (id: string): id is keyof BuiltinWidgets => {
  return !!builtin()[id as keyof BuiltinWidgets];
};

export default builtin;

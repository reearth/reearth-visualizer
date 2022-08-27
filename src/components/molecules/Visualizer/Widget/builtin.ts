import Button from "./Button";
import Menu from "./Menu";
import SplashScreen from "./SplashScreen";
import Storytelling from "./Storytelling";
import Timeline from "./Timeline";

import type { Component } from ".";

export const MENU_BUILTIN_WIDGET_ID = "reearth/menu";
export const BUTTON_BUILTIN_WIDGET_ID = "reearth/button";
export const SPLASHSCREEN_BUILTIN_WIDGET_ID = "reearth/splashscreen";
export const STORYTELLING_BUILTIN_WIDGET_ID = "reearth/storytelling";
export const TIMELINE_BUILTIN_WIDGET_ID = "reearth/timeline";

export type BuiltinWidgets<T = unknown> = Record<
  | typeof MENU_BUILTIN_WIDGET_ID
  | typeof BUTTON_BUILTIN_WIDGET_ID
  | typeof SPLASHSCREEN_BUILTIN_WIDGET_ID
  | typeof STORYTELLING_BUILTIN_WIDGET_ID
  | typeof TIMELINE_BUILTIN_WIDGET_ID,
  T
>;

const BUILTIN_WIDGET_ID_LIST: BuiltinWidgets<boolean> = {
  [MENU_BUILTIN_WIDGET_ID]: true,
  [BUTTON_BUILTIN_WIDGET_ID]: true,
  [SPLASHSCREEN_BUILTIN_WIDGET_ID]: true,
  [STORYTELLING_BUILTIN_WIDGET_ID]: true,
  [TIMELINE_BUILTIN_WIDGET_ID]: true,
};
export const isBuiltinWidget = (id: string): id is keyof BuiltinWidgets =>
  !!BUILTIN_WIDGET_ID_LIST[id as keyof BuiltinWidgets];

const builtin: BuiltinWidgets<Component> = {
  [MENU_BUILTIN_WIDGET_ID]: Menu,
  [BUTTON_BUILTIN_WIDGET_ID]: Button,
  [SPLASHSCREEN_BUILTIN_WIDGET_ID]: SplashScreen,
  [STORYTELLING_BUILTIN_WIDGET_ID]: Storytelling,
  [TIMELINE_BUILTIN_WIDGET_ID]: Timeline,
};

export default builtin;

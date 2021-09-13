import Menu from "./Menu";
import SplashScreen from "./SplashScreen";
import Storytelling from "./Storytelling";

import type { Component } from ".";

const builtin: Record<string, Component> = {
  "reearth/menu": Menu,
  "reearth/splashscreen": SplashScreen,
  "reearth/storytelling": Storytelling,
};

export default builtin;

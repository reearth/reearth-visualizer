import Button from "./Button";
import Menu from "./Menu";
import SplashScreen from "./SplashScreen";
import Storytelling from "./Storytelling";

import type { Component } from ".";

const builtin: Record<string, Component> = {
  "reearth/menu": Menu,
  "reearth/button": Button,
  "reearth/splashscreen": SplashScreen,
  "reearth/storytelling": Storytelling,
};

export default builtin;

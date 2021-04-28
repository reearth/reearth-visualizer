import { WidgetComponent } from "../../PluginWidget";

import Navigator from "./navigator";
import SplashScreen from "./splashscreen";
import Menu from "./menu";
import Storytelling from "./storytelling";

export default {
  navigator: Navigator,
  splashscreen: SplashScreen,
  menu: Menu,
  storytelling: Storytelling,
} as { [key: string]: WidgetComponent };

export type PluginProperty = {};

import tinycolor from "tinycolor2";

import { dark } from "./darkTheme";
import { forest } from "./forestTheme";
import { light } from "./lightTheme";
import { PublishTheme, SceneThemeOptions } from "./types";

const isDark = (hex: string): boolean => tinycolor(hex).isDark();

export function mask(color?: string) {
  if (!color) return;
  return isDark(color) ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)";
}

const themeDefaults = {
  type: "dark",
  backgroundColor: "#dfe5f0",
  textColor: "#434343",
  selectColor: "#C52C63",
};

const premadeThemes: Record<string, PublishTheme | undefined> = {
  dark,
  light,
  forest,
};

export function publishTheme(sceneThemeOptions?: SceneThemeOptions): PublishTheme {
  const premadeTheme = premadeThemes[sceneThemeOptions?.themeType || themeDefaults.type];
  if (premadeTheme) return premadeTheme;

  const options = {
    ...sceneThemeOptions,
    themeBackgroundColor: sceneThemeOptions?.themeBackgroundColor || themeDefaults.backgroundColor,
    themeTextColor: sceneThemeOptions?.themeTextColor || themeDefaults.textColor,
    themeSelectColor: sceneThemeOptions?.themeSelectColor || themeDefaults.selectColor,
  };

  const isBackgroundDark = isDark(options?.themeBackgroundColor);

  return {
    mask: mask(options?.themeBackgroundColor) || "rgba(255, 255, 255, 0.15)",
    background: options.themeBackgroundColor,
    mainText: options.themeTextColor,
    select: options.themeSelectColor,
    strongIcon: isBackgroundDark
      ? tinycolor(options.themeTextColor).lighten(25).toHex8String()
      : "#FFFFFF",
    strongText: isBackgroundDark
      ? tinycolor(options.themeTextColor).lighten(25).toHex8String()
      : "#FFFFFF",
    weakText: tinycolor(options.themeTextColor).setAlpha(0.5).toHex8String(),
    mainIcon: tinycolor(options.themeTextColor).setAlpha(0.5).toHex8String(),
    weakIcon: tinycolor(options.themeTextColor).setAlpha(0.25).toHex8String(),
  };
}

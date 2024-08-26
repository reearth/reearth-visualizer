import { useMemo } from "react";
import tinycolor from "tinycolor2";

import { dark } from "./dark";
import { forest } from "./forest";
import { light } from "./light";

export type Theme = {
  strongText: string;
  mainText: string;
  weakText: string;
  strongIcon: string;
  mainIcon: string;
  weakIcon: string;
  select: string;
  mask: string;
  background: string;
};

export type WidgetThemeOptions = {
  themeType?: "light" | "dark" | "forest" | "custom";
  themeTextColor?: string;
  themeSelectColor?: string;
  themeBackgroundColor?: string;
};

const isDark = (hex: string): boolean => tinycolor(hex).isDark();

const defaultThemeType = "dark";
const premade: Record<string, Theme | undefined> = {
  dark,
  light,
  forest,
};

export function mask(color?: string) {
  if (!color) return;
  return isDark(color) ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)";
}

export function usePublishTheme(sceneThemeOptions?: WidgetThemeOptions): Theme {
  return useMemo(() => publishTheme(sceneThemeOptions), [sceneThemeOptions]);
}

export function publishTheme(sceneThemeOptions?: WidgetThemeOptions): Theme {
  const premadeTheme = premade[sceneThemeOptions?.themeType || defaultThemeType];
  if (premadeTheme) return premadeTheme;

  const options = {
    ...sceneThemeOptions,
    themeBackgroundColor: sceneThemeOptions?.themeBackgroundColor || "#dfe5f0",
    themeTextColor: sceneThemeOptions?.themeTextColor || "#434343",
    themeSelectColor: sceneThemeOptions?.themeSelectColor || "#C52C63",
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

import { css } from "@reearth/theme";

import { Typography } from "./types";

export type { Typography } from "./types";

export const typographyStyles = (t?: Typography) => {
  if (!t) return null;
  return css`
    font: ${toCSSFont(t)};
    text-decoration: ${toTextDecoration(t)};
    color: ${t.color ?? null};
    text-align: ${t.textAlign ?? null};
  `;
};

export const getCSSFontFamily = (f?: string) => {
  return !f
    ? undefined
    : f === "YuGothic"
    ? `"游ゴシック体", YuGothic, "游ゴシック Medium", "Yu Gothic Medium", "游ゴシック", "Yu Gothic"`
    : f;
};

export const toCSSFont = (t?: Typography, d?: Typography) => {
  const ff = getCSSFontFamily(t?.fontFamily ?? d?.fontFamily)
    ?.replace("'", '"')
    .trim();
  return `${t?.italic ?? d?.italic ? "italic " : ""}${
    t?.bold ?? d?.bold ? "bold " : (t?.fontWeight ?? d?.fontWeight ?? "") + " " ?? ""
  }${t?.fontSize ?? d?.fontSize ?? 16}px ${
    ff ? (ff.includes(`"`) ? ff : `"${ff}"`) : "sans-serif"
  }`;
};

export const toTextDecoration = (t?: Typography) => (t?.underline ? "underline" : "none");

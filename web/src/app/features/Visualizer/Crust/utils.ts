import { css } from "@reearth/services/theme";
import { useCallback, useRef } from "react";

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
  return `${(t?.italic ?? d?.italic) ? "italic " : ""}${
    (t?.bold ?? d?.bold)
      ? "bold "
      : (t?.fontWeight ?? d?.fontWeight ?? "") + " "
  }${t?.fontSize ?? d?.fontSize ?? 16}px ${
    ff ? (ff.includes(`"`) ? ff : `"${ff}"`) : "sans-serif"
  }`;
};

export const toTextDecoration = (t?: Typography) =>
  t?.underline ? "underline" : "none";

export function useGet<T>(value: T): () => T {
  const ref = useRef<T>(value);
  ref.current = value;
  return useCallback(() => ref.current, []);
}

export function normalizeHex(input: string) {
  let v = input.trim();
  if (!v) return "#FFFFFF";
  if (!v.startsWith("#")) v = `#${v}`;
  v = v.toUpperCase().slice(0, 7);
  if (v.length === 1) return "#";
  return v;
}

export function isValidHex(v: string) {
  return /^#[0-9A-F]{6}$/.test(v);
}

export const extractLines = (l: any): [number, number][][] => {
  if (l?.type === "LineString") return [l.coordinates ?? []];
  if (l?.type === "MultiLineString") return l.coordinates ?? [];
  if (l?.type === "FeatureCollection")
    return (l.features ?? []).flatMap((f: any) => extractLines(f.geometry));
  return [];
};

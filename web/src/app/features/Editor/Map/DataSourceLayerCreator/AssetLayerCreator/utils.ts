import { DataType } from "@reearth/core";

import { LayerAsset } from "./types";

// Every format an asset can be added as. CMS supports them all; Visualizer
// assets are files uploaded here, so only ASSET_FORMATS.
export type LayerFormat = Extract<
  DataType,
  "geojson" | "csv" | "kml" | "czml" | "mvt" | "wms" | "3dtiles"
>;
export type AssetFormat = Extract<LayerFormat, "geojson" | "csv" | "kml" | "czml">;

export const FORMAT_LABELS: Record<LayerFormat, string> = {
  geojson: "GeoJSON",
  csv: "CSV",
  kml: "KML",
  czml: "CZML",
  mvt: "MVT",
  wms: "WMS",
  "3dtiles": "3D Tiles"
};

// MVT and WMS show only the layers named before adding.
export const needsLayerNames = (format?: LayerFormat) =>
  format === "mvt" || format === "wms";

// File extensions of each format that can be uploaded.
export const ASSET_FORMATS: Record<AssetFormat, { extensions: string[] }> = {
  geojson: { extensions: ["geojson", "json"] },
  csv: { extensions: ["csv"] },
  kml: { extensions: ["kml", "kmz"] },
  czml: { extensions: ["czml"] }
};

export const ACCEPT_STRING = Object.values(ASSET_FORMATS)
  .flatMap((f) => f.extensions)
  .map((ext) => `.${ext}`)
  .join(",");

export const formatOf = (url: string): AssetFormat | undefined => {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  return (Object.keys(ASSET_FORMATS) as AssetFormat[]).find((f) =>
    ASSET_FORMATS[f].extensions.includes(ext)
  );
};

// The format CMS states, or the one the file extension implies. MVT, WMS and
// 3D Tiles can't be told from the URL (a tileset.json looks like GeoJSON).
export const assetFormat = (asset: LayerAsset): LayerFormat | undefined =>
  asset.format ?? formatOf(asset.url);

// e.g. 360 → "360 Bytes", 91115 → "88.98 KB".
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Bytes`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${Number(value.toFixed(2))} ${units[unit]}`;
};

// e.g. "2023-04-19 11:28", in local time.
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

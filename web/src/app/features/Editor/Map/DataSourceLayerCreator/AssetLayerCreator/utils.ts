import { DataType } from "@reearth/core";

import { isWmsUrl } from "../UrlLayerCreator/utils";

import { AssetTab, LayerAsset, SortKey } from "./types";

// Every format an asset can be added as. CMS supports them all; Visualizer
// assets are files uploaded here, so only ASSET_FORMATS.
export type LayerFormat = Extract<
  DataType,
  "geojson" | "csv" | "kml" | "czml" | "mvt" | "wms" | "3dtiles"
>;
export type AssetFormat = Extract<
  LayerFormat,
  "geojson" | "csv" | "kml" | "czml"
>;

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

// The URL's path without its query or fragment.
const pathOf = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split(/[?#]/)[0];
  }
};

export const formatOf = (url: string): AssetFormat | undefined => {
  const ext = pathOf(url).split(".").pop()?.toLowerCase() ?? "";
  return (Object.keys(ASSET_FORMATS) as AssetFormat[]).find((f) =>
    ASSET_FORMATS[f].extensions.includes(ext)
  );
};

// The format CMS states, or the one the file extension implies. MVT, WMS and
// 3D Tiles can't be told from the URL (a tileset.json looks like GeoJSON).
export const assetFormat = (asset: LayerAsset): LayerFormat | undefined =>
  asset.format ?? formatOf(asset.url);

// The list view's grid columns on each tab, shared by its header and rows.
export const LIST_COLUMNS: Record<AssetTab, string> = {
  visualizer: "1fr 120px 140px",
  cmsAssets: "minmax(0, 1.4fr) minmax(0, 1fr) 80px 120px",
  cmsModels: "minmax(0, 1.4fr) minmax(0, 1fr) 140px"
};

const MVT_TEMPLATE = "{z}/{x}/{y}.mvt";

// How a CMS asset is added as a layer: the URL and format to load it with.
// - MVT is an asset CMS gives the MVT preview type, or a .mvt / .pbf file.
//   Its tiles are served from a {z}/{x}/{y} template, found as CMS's own
//   viewer does: a tile's z/x/y path is replaced, an archive is served next
//   to it once CMS has extracted it, and a lone file from its folder.
// - 3D Tiles is an asset CMS gives the 3D Tiles preview type: its tileset
//   entry point (.json), or an archive whose tileset.json is served next to
//   it once extracted.
// - WMS has no preview type in CMS, so it is recognised from the URL.
// - Other formats go by the extension.
export const cmsAssetLayer = (asset: {
  url: string;
  previewType?: string | null;
  archiveExtractionStatus?: string | null;
}): { url: string; format?: LayerFormat } => {
  const { url } = asset;
  // Paths are matched and rewritten without the query or fragment, which are
  // kept (e.g. an access token every tile needs).
  const path = url.split(/[?#]/)[0];
  const rest = url.slice(path.length);
  const withPath = (newPath: string) => newPath + rest;
  const extracted =
    /\.(zip|7z)$/i.test(path) &&
    asset.archiveExtractionStatus?.toLowerCase() === "done";
  const archiveDir = path.replace(/\.(zip|7z)$/i, "");
  if (asset.previewType?.toLowerCase() === "geo_3d_tiles") {
    if (/\.json$/i.test(path)) return { url, format: "3dtiles" };
    if (extracted)
      return { url: withPath(`${archiveDir}/tileset.json`), format: "3dtiles" };
    return { url };
  }

  const mvtFile = /\.(mvt|pbf)$/i.test(path);
  if (asset.previewType?.toLowerCase() !== "geo_mvt" && !mvtFile)
    return isWmsUrl(url) ? { url, format: "wms" } : { url };

  const tile = /\/\d{1,5}\/\d{1,5}\/\d{1,5}\.(mvt|pbf)$/i;
  if (tile.test(path))
    return {
      url: withPath(path.replace(tile, `/${MVT_TEMPLATE}`)),
      format: "mvt"
    };
  if (mvtFile)
    return {
      url: withPath(path.replace(/\/[^/]+$/, `/${MVT_TEMPLATE}`)),
      format: "mvt"
    };
  if (extracted)
    return { url: withPath(`${archiveDir}/${MVT_TEMPLATE}`), format: "mvt" };
  // Not extracted (yet), or not something tiles can be served from.
  return { url };
};

// Why the selected CMS model or asset can't be added: a model not served as
// GeoJSON, or a private asset, whose URL needs CMS credentials to load.
export type AddIssue = "noGeometry" | "unavailable" | "private";

const MODEL_CHECK_TIMEOUT_MS = 15000;

// A CMS model is served as GeoJSON only when it is published to the Public
// API (otherwise 404) and has a geometry field (otherwise CMS fails with "no
// geometry field in this model"). Fetches a single item to find out.
export const checkModelGeoJson = async (
  url: string,
  signal: AbortSignal
): Promise<AddIssue | undefined> => {
  // Aborted by the caller or after the timeout. (AbortSignal.any would do,
  // but it needs Safari 17.4+.)
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeout = setTimeout(abort, MODEL_CHECK_TIMEOUT_MS);
  if (signal.aborted) abort();
  else signal.addEventListener("abort", abort, { once: true });
  try {
    const res = await fetch(`${url}?limit=1`, { signal: controller.signal });
    if (res.ok) {
      res.body?.cancel().catch(() => undefined);
      return undefined;
    }
    const body = await res.text().catch(() => "");
    return res.status !== 404 && /geometry/i.test(body)
      ? "noGeometry"
      : "unavailable";
  } catch {
    return "unavailable";
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", abort);
  }
};

// For sources the server can't sort, such as CMS.
export const sortAssets = (assets: LayerAsset[], sort: SortKey) => {
  const [field, direction] = sort.split("-");
  const sign = direction === "asc" ? 1 : -1;
  return [...assets].sort(
    (a, b) =>
      sign *
      (field === "name"
        ? a.name.localeCompare(b.name)
        : field === "size"
          ? a.size - b.size
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  );
};

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

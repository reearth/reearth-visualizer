import { DataType } from "@reearth/core";

export type AssetFormat = Extract<DataType, "geojson" | "csv" | "kml" | "czml">;

// Display label and file extensions of each format that can be added as a layer.
export const ASSET_FORMATS: Record<
  AssetFormat,
  { label: string; extensions: string[] }
> = {
  geojson: { label: "GeoJSON", extensions: ["geojson", "json"] },
  csv: { label: "CSV", extensions: ["csv"] },
  kml: { label: "KML", extensions: ["kml", "kmz"] },
  czml: { label: "CZML", extensions: ["czml"] }
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

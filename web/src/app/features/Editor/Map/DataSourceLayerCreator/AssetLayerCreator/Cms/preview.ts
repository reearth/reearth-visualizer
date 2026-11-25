import { LayerAsset } from "../types";
import { assetFormat, checkModelGeoJson } from "../utils";

// What the details popover of a CMS asset or model shows.
export type AssetPreview =
  // A CSV's first rows and whether it has coordinate columns, or a model's
  // first items, their total, and whether it lacks a geometry field (so it
  // can't be added as a layer).
  | {
      type: "table";
      columns: string[];
      rows: string[][];
      hasLatLng?: boolean;
      noGeometry?: boolean;
      total?: number;
    }
  // The shapes of a GeoJSON, KML or CZML, and the properties they hold.
  | {
      type: "features";
      count: number;
      geometryType?: string;
      properties: string[];
      shapes: Shape[];
    }
  | { type: "unsupported" | "private" | "tooLarge" | "error" };

// [lng, lat] rings: one of one position for a point, one for a line, the
// outer ring and holes for a polygon.
export type Shape = { kind: "point" | "line" | "polygon"; rings: number[][][] };

type Item = Record<string, unknown>;
type Geometry = {
  type?: string;
  coordinates?: unknown;
  geometries?: Geometry[];
};
type Feature = { geometry?: Geometry | null; properties?: object | null };
type PreviewSource = Pick<LayerAsset, "url" | "size" | "private" | "format">;

export const MAX_PREVIEW_BYTES = 10 * 1024 * 1024;
const CSV_ROWS = 3;
const MODEL_ITEMS = 5;
// Kept small so a big file still draws quickly.
const MAX_SHAPES = 500;

// The preview, if it can be told without loading anything. Models are always
// loaded; a CSV is only read up to its first rows, so any size will do.
export const quickPreview = (
  asset: PreviewSource,
  isModel: boolean
): AssetPreview | undefined => {
  if (isModel) return undefined;
  const format = assetFormat(asset);
  if (asset.private) return { type: "private" };
  // KMZ is zipped.
  if (
    !["csv", "geojson", "kml", "czml"].includes(format ?? "") ||
    /\.kmz($|[?#])/i.test(asset.url)
  )
    return { type: "unsupported" };
  if (format !== "csv" && asset.size > MAX_PREVIEW_BYTES)
    return { type: "tooLarge" };
  return undefined;
};

export const loadPreview = async (
  asset: PreviewSource,
  isModel: boolean,
  signal: AbortSignal
): Promise<AssetPreview> => {
  const quick = quickPreview(asset, isModel);
  if (quick) return quick;
  // Aborted by the caller or after 15 seconds.
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeout = setTimeout(abort, 15000);
  signal.addEventListener("abort", abort);
  try {
    if (isModel) {
      // A model's URL is its items as GeoJSON; without ".geojson" the CMS
      // Public API serves them as JSON, with their total count. Checked too
      // as adding it does: whether it's served as GeoJSON at all.
      const [res, issue] = await Promise.all([
        fetch(`${asset.url.replace(/\.geojson$/, "")}?limit=${MODEL_ITEMS}`, {
          signal: controller.signal
        }),
        checkModelGeoJson(asset.url, controller.signal)
      ]);
      if (!res.ok) return { type: "error" };
      const { results = [], totalCount } = await res.json();
      return {
        ...itemsTable(results),
        total: totalCount ?? results.length,
        noGeometry: issue === "noGeometry"
      };
    }
    const res = await fetch(asset.url, { signal: controller.signal });
    if (!res.ok) return { type: "error" };
    const format = assetFormat(asset);
    if (format === "csv") {
      const records = await readCsv(res, CSV_ROWS + 1);
      return records ? csvTable(records) : { type: "tooLarge" };
    }
    // Not every server states the size up front, so it's checked here too.
    if (Number(res.headers.get("content-length")) > MAX_PREVIEW_BYTES)
      return { type: "tooLarge" };
    const text = await res.text();
    return summarize(
      format === "kml"
        ? kmlFeatures(text)
        : format === "czml"
          ? czmlFeatures(JSON.parse(text))
          : geojsonFeatures(JSON.parse(text))
    );
  } catch {
    return { type: "error" };
  } finally {
    // Also stops a download that's left unread, such as one too large.
    clearTimeout(timeout);
    abort();
  }
};

// Tables

// The item id and CMS's metadata ($createdAt, $updatedBy and other $ keys).
const METADATA = ["id", "createdAt", "createdBy", "updatedAt", "updatedBy"];

// A model's first items as a table, headed by their keys: the fields every
// one of them can show in a cell, leaving out metadata.
export const itemsTable = (items: Item[]) => {
  const shown = items.slice(0, MODEL_ITEMS);
  const columns = [...new Set(shown.flatMap(Object.keys))].filter(
    (key) =>
      !key.startsWith("$") &&
      !METADATA.includes(key) &&
      shown.every((item) => cellText(item[key]) !== undefined)
  );
  return {
    type: "table" as const,
    columns,
    rows: shown.map((item) => columns.map((key) => cellText(item[key]) ?? ""))
  };
};

// e.g. 538500 → "538,500", "2024-03-02T00:00:00Z" → "2024-03-02", a tag
// {name: "city"} → "city". Undefined for other objects, such as a geometry.
export const cellText = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return value.toLocaleString("en-US");
  if (Array.isArray(value)) {
    const parts = value.map(cellText);
    return parts.includes(undefined) ? undefined : parts.join(", ");
  }
  if (typeof value === "object")
    return "name" in value ? cellText(value.name) : undefined;
  return String(value).replace(/^(\d{4}-\d{2}-\d{2})T.*/, "$1");
};

// The first non-empty records, reading no more of the file than they need.
// Undefined when they aren't found in the first MAX_PREVIEW_BYTES.
const readCsv = async (res: Response, count: number) => {
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  const read = csvReader();
  let bytes = 0;
  try {
    for (;;) {
      const chunk = await reader?.read();
      const done = !chunk || chunk.done;
      bytes += chunk?.value?.length ?? 0;
      // A newline at the end completes the last record.
      const records = read(
        decoder.decode(chunk?.value, { stream: !done }) + (done ? "\n" : "")
      );
      if (done || records.length >= count) return records.slice(0, count);
      if (bytes > MAX_PREVIEW_BYTES) return undefined;
    }
  } finally {
    reader?.cancel().catch(() => undefined);
  }
};

export const csvTable = (records: string[][]): AssetPreview => {
  if (!records.length) return { type: "error" };
  const [columns, ...rows] = records;
  const names = columns.map((c) => c.trim().toLowerCase());
  const has = (options: string[]) => names.some((n) => options.includes(n));
  return {
    type: "table",
    columns,
    rows,
    hasLatLng:
      has(["lat", "latitude", "緯度"]) &&
      has(["lng", "lon", "long", "longitude", "経度"])
  };
};

// Reads CSV text, piece by piece, into its non-empty records: fields split
// by commas and records by newlines, except within quotes ("a, b", a line
// break, and "" for a quote). Each call returns all records completed so far.
export const csvReader = () => {
  const records: string[][] = [];
  let record = [""];
  let quoted = false;
  let last = "";
  return (text: string) => {
    for (const c of text) {
      if (c === '"') {
        // A quote right after a closing one is a quote within the field.
        if (!quoted && last === '"') record[record.length - 1] += c;
        quoted = !quoted;
      } else if (quoted) record[record.length - 1] += c;
      else if (c === ",") record.push("");
      else if (c === "\n") {
        if (record.some((f) => f.trim())) records.push(record);
        record = [""];
      } else if (c !== "\r") record[record.length - 1] += c;
      last = c;
    }
    return records;
  };
};

// Features: KML and CZML are read as GeoJSON, then summarized.

const KINDS: Record<string, Shape["kind"]> = {
  Point: "point",
  LineString: "line",
  Polygon: "polygon"
};

const geometryShapes = (g?: Geometry | null): Shape[] => {
  if (g?.type === "GeometryCollection")
    return (g.geometries ?? []).flatMap(geometryShapes);
  const kind = KINDS[g?.type?.replace(/^Multi/, "") ?? ""];
  if (!kind) return [];
  const parts = (
    g?.type?.startsWith("Multi") ? g.coordinates : [g?.coordinates]
  ) as never[];
  return parts.map((c) => ({
    kind,
    rings: kind === "point" ? [[c]] : kind === "line" ? [c] : c
  }));
};

export const summarize = (features: Feature[]): AssetPreview => {
  const types = [...new Set(features.map((f) => f.geometry?.type ?? "None"))];
  return {
    type: "features",
    count: features.length,
    geometryType: types.length > 1 ? "Mixed" : types[0],
    properties: [
      ...new Set(features.flatMap((f) => Object.keys(f.properties ?? {})))
    ],
    shapes: features
      .flatMap((f) => geometryShapes(f.geometry))
      .filter((s) => {
        const positions = s.rings.flat();
        return (
          positions.length &&
          positions.every(
            (p) => Number.isFinite(p?.[0]) && Number.isFinite(p?.[1])
          )
        );
      })
      .slice(0, MAX_SHAPES)
  };
};

// The shapes fitted into a box, as SVG paths (and positions for points),
// keeping their proportions: longitude is scaled for latitude.
export const shapePaths = (
  shapes: Shape[],
  { width, height }: { width: number; height: number },
  pad = 8
) => {
  // Found in a loop: spreading every position into Math.min would exceed
  // the engine's argument limit for a large shape.
  let [minLng, maxLng, minLat, maxLat] = [
    Infinity,
    -Infinity,
    Infinity,
    -Infinity
  ];
  for (const { rings } of shapes)
    for (const ring of rings)
      for (const [lng, lat] of ring) {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
  const kx = Math.cos(((minLat + maxLat) / 360) * Math.PI);
  const w = (maxLng - minLng) * kx || 1;
  const h = maxLat - minLat || 1;
  const scale = Math.min((width - pad * 2) / w, (height - pad * 2) / h);
  const xy = ([lng, lat]: number[]) => [
    Math.round((width - w * scale) / 2 + (lng - minLng) * kx * scale),
    Math.round((height - h * scale) / 2 + (maxLat - lat) * scale)
  ];
  return shapes.map(({ kind, rings }) => {
    const [x, y] = xy(rings[0][0]);
    const d = rings
      .map((r) => `M${r.map(xy).join("L")}${kind === "polygon" ? "Z" : ""}`)
      .join("");
    return { kind, d, x, y };
  });
};

// A FeatureCollection, a single Feature, or a bare geometry.
export const geojsonFeatures = (json: {
  type?: string;
  features?: Feature[];
}): Feature[] =>
  json.type === "FeatureCollection"
    ? (json.features ?? [])
    : [
        json.type === "Feature"
          ? (json as Feature)
          : { geometry: json as Geometry }
      ];

// KML coordinates are "lng,lat[,alt] lng,lat[,alt] ...", read as [lng, lat].
const kmlCoordinates = (el: Element) =>
  (el.getElementsByTagName("coordinates")[0]?.textContent ?? "")
    .trim()
    .split(/\s+/)
    .map((t) => t.split(",").slice(0, 2).map(Number));

const kmlGeometry = (el: Element): Geometry => ({
  type: el.localName,
  coordinates:
    el.localName === "Point"
      ? kmlCoordinates(el)[0]
      : el.localName === "LineString"
        ? kmlCoordinates(el)
        : Array.from(el.getElementsByTagName("LinearRing"), kmlCoordinates)
});

// Each placemark is a feature: its geometry (several make a collection),
// and its data names as properties.
export const kmlFeatures = (text: string): Feature[] => {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid KML");
  return Array.from(doc.getElementsByTagName("Placemark"), (placemark) => {
    const geometries = Array.from(placemark.getElementsByTagName("*"))
      .filter((el) => el.localName in KINDS)
      .map(kmlGeometry);
    const names = Array.from(
      placemark.querySelectorAll("Data, SimpleData"),
      (d) => d.getAttribute("name")
    );
    return {
      geometry:
        geometries.length > 1
          ? { type: "GeometryCollection", geometries }
          : geometries[0],
      properties: Object.fromEntries(names.filter(Boolean).map((n) => [n, n]))
    };
  });
};

type CzmlPositions = { cartographicDegrees?: number[] };
type CzmlPacket = {
  id?: string;
  position?: CzmlPositions;
  polyline?: { positions?: CzmlPositions };
  polygon?: { positions?: CzmlPositions };
  properties?: object;
};

// [lng, lat, height, ...], or [time, lng, lat, height, ...] when sampled.
const czmlCoordinates = (values: number[] = [], sampled = false) => {
  const step = sampled ? 4 : 3;
  return Array.from({ length: Math.floor(values.length / step) }, (_, i) => {
    const at = i * step + (sampled ? 1 : 0);
    return [values[at], values[at + 1]];
  });
};

const czmlGeometry = ({
  polygon,
  polyline,
  position
}: CzmlPacket): Geometry | undefined => {
  const point = position?.cartographicDegrees;
  if (polygon?.positions)
    return {
      type: "Polygon",
      coordinates: [czmlCoordinates(polygon.positions.cartographicDegrees)]
    };
  if (polyline?.positions)
    return {
      type: "LineString",
      coordinates: czmlCoordinates(polyline.positions.cartographicDegrees)
    };
  if (point)
    return {
      type: "Point",
      coordinates: czmlCoordinates(point, point.length > 3)[0]
    };
  return undefined;
};

// Each packet with a position, polyline or polygon is a feature; the
// document packet is skipped.
export const czmlFeatures = (packets: CzmlPacket[]): Feature[] => {
  if (!Array.isArray(packets)) throw new Error("Invalid CZML");
  return packets
    .filter((p) => p.id !== "document" && czmlGeometry(p))
    .map((p) => ({ geometry: czmlGeometry(p), properties: p.properties }));
};

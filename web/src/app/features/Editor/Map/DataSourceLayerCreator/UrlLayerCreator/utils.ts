import { DataType } from "@reearth/core";

export type UrlFormat = Extract<
  DataType,
  "geojson" | "csv" | "czml" | "kml" | "mvt" | "wms" | "3dtiles"
>;

// Display label and accepted file extensions per format. WMS is a service
// endpoint, so it has no extension.
export const FORMATS: Record<
  UrlFormat,
  { label: string; extensions: string[] }
> = {
  geojson: { label: "GeoJSON", extensions: [".geojson", ".json"] },
  csv: { label: "CSV", extensions: [".csv"] },
  czml: { label: "CZML", extensions: [".czml"] },
  kml: { label: "KML", extensions: [".kml", ".kmz"] },
  mvt: { label: "MVT", extensions: [".pbf", ".mvt"] },
  wms: { label: "WMS", extensions: [] },
  "3dtiles": { label: "3D Tiles", extensions: [".json"] }
};

// Why a URL can't be added for the selected format.
export type UrlIssue =
  // Client-side checks (validateUrl).
  | { reason: "invalidUrl" } // not http(s)
  | { reason: "wrongFormat"; detected: UrlFormat } // extension of another format
  | { reason: "extension" } // extension not accepted by the format
  | { reason: "missingEntryPoint" } // 3D Tiles folder instead of tileset.json
  | { reason: "tileTemplate" } // MVT without {z}/{x}/{y}
  // Server response (checkResponse).
  | { reason: "unreachable" } // network/CORS failure, timeout or non-2xx
  | { reason: "invalidData" }; // empty or corrupt body

const parseUrl = (url: string): URL | undefined => {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
};

// Malformed %-escapes are left as-is rather than throwing.
const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// URL query parameter names (e.g. WMS LAYERS) are case-insensitive.
const findParams = (params: URLSearchParams, name: string) =>
  [...params.keys()].filter((k) => k.toLowerCase() === name);

const matchesExtension = (pathname: string, format: UrlFormat) =>
  FORMATS[format].extensions.some((ext) => pathname.endsWith(ext));

// ".json" is shared by GeoJSON and 3D Tiles; tileset.json means 3D Tiles.
const detectFormat = (pathname: string): UrlFormat | undefined =>
  pathname.endsWith("tileset.json")
    ? "3dtiles"
    : (Object.keys(FORMATS) as UrlFormat[]).find((f) =>
        matchesExtension(pathname, f)
      );

// Whether the last path segment has a file extension.
const hasExtension = (pathname: string) => /\.[^/.]+$/.test(pathname);

// Checks the URL's syntax and extension against the selected format, without
// any request.
export const validateUrl = (
  url: string,
  format: UrlFormat
): UrlIssue | undefined => {
  const parsed = parseUrl(url);
  if (parsed?.protocol !== "http:" && parsed?.protocol !== "https:")
    return { reason: "invalidUrl" };

  if (format === "mvt" && !["{z}", "{x}", "{y}"].every((p) => url.includes(p)))
    return { reason: "tileTemplate" };

  const pathname = safeDecode(parsed.pathname).toLowerCase();
  const detected = detectFormat(pathname);
  if (detected === format) return undefined;

  // Entry points are not always named tileset.json, so any .json may be 3D
  // Tiles; checkResponse then requires the tileset's "asset" property.
  if (format === "3dtiles" && pathname.endsWith(".json")) return undefined;
  if (detected) return { reason: "wrongFormat", detected };

  if (format === "wms") return undefined;
  if (format === "3dtiles") return { reason: "missingEntryPoint" };
  // Data served from an API endpoint may have no extension; checkResponse
  // inspects the body instead. MVT is excluded as its body isn't inspected.
  if (format !== "mvt" && !hasExtension(pathname)) return undefined;
  return { reason: "extension" };
};

// Layer names from a WMS URL's LAYERS parameter, so a full GetMap URL needs no
// manual layer entry.
export const wmsLayersFromUrl = (url: string): string[] => {
  const params = parseUrl(url)?.searchParams;
  const [key] = params ? findParams(params, "layers") : [];
  if (!params || !key) return [];
  return (params.get(key) ?? "")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
};

const TIMEOUT_MS = 15000;
// Enough of the body to spot empty or corrupt data without downloading large
// files twice (once here, once by the map).
const SAMPLE_BYTES = 64 * 1024;

// Tile templates are filled in, and WMS asks for its capabilities since the
// bare endpoint may not answer.
const requestUrl = (url: string, format: UrlFormat): string => {
  if (format === "mvt")
    return url.replace("{z}", "0").replace("{x}", "0").replace("{y}", "0");
  if (format === "wms") {
    const capabilities = new URL(url);
    const params = capabilities.searchParams;
    [
      ...findParams(params, "service"),
      ...findParams(params, "request")
    ].forEach((k) => params.delete(k));
    params.set("SERVICE", "WMS");
    params.set("REQUEST", "GetCapabilities");
    return capabilities.toString();
  }
  return url;
};

const readSample = async (res: Response) => {
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let size = 0;
  while (reader && size < SAMPLE_BYTES) {
    const { done, value } = await reader.read();
    if (done) return { text, complete: true };
    size += value.length;
    text += decoder.decode(value, { stream: true });
  }
  reader?.cancel().catch(() => undefined);
  return { text, complete: !reader };
};

const isJson = (text: string) => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

// Whether the sampled body plausibly holds data of the given format. When the
// whole body was read, JSON formats are fully parsed to catch truncation.
const looksValid = (
  format: UrlFormat,
  { text, complete }: { text: string; complete: boolean }
): boolean => {
  const body = text.replace(/^\uFEFF/, "").trim();
  if (!body) return false;
  switch (format) {
    case "geojson":
    case "czml":
      return /^[[{]/.test(body) && (!complete || isJson(body));
    case "3dtiles":
      // "asset" is required at the top of every tileset.
      return (
        body.startsWith("{") &&
        /"asset"\s*:/.test(body) &&
        (!complete || isJson(body))
      );
    case "kml":
      // KMZ is a zip archive ("PK" signature).
      return body.startsWith("PK") || /<kml[\s>]/i.test(body);
    case "wms":
      return /WMS_Capabilities|WMT_MS_Capabilities/.test(body);
    case "csv":
      // Not JSON, XML or an HTML page, and the header row has a delimiter.
      return !/^[[{<]/.test(body) && /[,;\t]/.test(body.split(/\r?\n/, 1)[0]);
    case "mvt":
      return true;
  }
};

// Fetches the URL from the browser and checks it is reachable and returns
// usable data for the format.
export const checkResponse = async (
  url: string,
  format: UrlFormat,
  signal: AbortSignal
): Promise<UrlIssue | undefined> => {
  try {
    const res = await fetch(requestUrl(url, format), {
      signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)])
    });
    // Tiles are binary and a missing 0/0/0 tile is normal for sources whose
    // min zoom is above 0, so MVT only checks reachability.
    if (format === "mvt" || !res.ok) {
      res.body?.cancel().catch(() => undefined);
      return res.ok || (format === "mvt" && res.status === 404)
        ? undefined
        : { reason: "unreachable" };
    }
    return looksValid(format, await readSample(res))
      ? undefined
      : { reason: "invalidData" };
  } catch {
    return { reason: "unreachable" };
  }
};

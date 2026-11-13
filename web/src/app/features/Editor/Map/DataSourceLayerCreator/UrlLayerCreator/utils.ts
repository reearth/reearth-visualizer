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

// Formats whose data is JSON, so a plain ".json" URL may hold any of them.
const JSON_FORMATS: UrlFormat[] = ["geojson", "czml", "3dtiles"];

const isTilesetJson = (pathname: string) =>
  pathname.split("/").pop() === "tileset.json";

// ".json" is shared by GeoJSON and 3D Tiles; tileset.json means 3D Tiles.
const detectFormat = (pathname: string): UrlFormat | undefined =>
  isTilesetJson(pathname)
    ? "3dtiles"
    : (Object.keys(FORMATS) as UrlFormat[]).find((f) =>
        matchesExtension(pathname, f)
      );

// A WMS endpoint has no extension, so it is told by SERVICE=WMS in the query
// or a path ending in "/wms" or a "…wms.cgi" script (e.g. MapServer).
export const isWmsUrl = (url: string): boolean => {
  const parsed = parseUrl(url);
  if (!parsed) return false;
  const lastSegment =
    safeDecode(parsed.pathname)
      .toLowerCase()
      .replace(/\/$/, "")
      .split("/")
      .pop() ?? "";
  return (
    findParams(parsed.searchParams, "service").some(
      (k) => parsed.searchParams.get(k)?.toLowerCase() === "wms"
    ) ||
    lastSegment === "wms" ||
    lastSegment.endsWith("wms.cgi")
  );
};

// Whether the last path segment has a file extension.
const hasExtension = (pathname: string) => /\.[^/.]+$/.test(pathname);

// The format the URL's extension identifies on its own, used to pre-select the
// format. A plain ".json" may be GeoJSON, CZML or 3D Tiles, so it is left to
// the user; WMS is told by isWmsUrl.
export const inferFormat = (url: string): UrlFormat | undefined => {
  const parsed = parseUrl(url);
  if (!parsed) return undefined;
  if (isWmsUrl(url)) return "wms";
  const pathname = safeDecode(parsed.pathname).toLowerCase();
  if (pathname.endsWith(".json") && !isTilesetJson(pathname)) return undefined;
  return detectFormat(pathname);
};

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

  // A plain .json (and a 3D Tiles entry point, which isn't always named
  // tileset.json) doesn't tell which JSON format it holds; checkResponse checks
  // the document structure against the selected format instead.
  if (
    JSON_FORMATS.includes(format) &&
    pathname.endsWith(".json") &&
    !isTilesetJson(pathname)
  )
    return undefined;
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

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

// The structure each JSON format requires at the top level of a complete
// document. The GeoJSON loader reads only a Feature or FeatureCollection.
const JSON_STRUCTURE: Record<
  "geojson" | "czml" | "3dtiles",
  (json: unknown) => boolean
> = {
  geojson: (json) =>
    isObject(json) &&
    (json.type === "Feature" ||
      (json.type === "FeatureCollection" && Array.isArray(json.features))),
  // An array of packets starting with the "document" packet.
  czml: (json) =>
    Array.isArray(json) && isObject(json[0]) && json[0].id === "document",
  // https://github.com/CesiumGS/3d-tiles/blob/main/specification/schema/tileset.schema.json
  "3dtiles": (json) =>
    isObject(json) &&
    isObject(json.asset) &&
    "geometricError" in json &&
    isObject(json.root)
};

// The same checks on a truncated sample, which can't be parsed.
const JSON_PREFIX: Record<"geojson" | "czml" | "3dtiles", RegExp> = {
  geojson: /^\{[\s\S]*"type"\s*:\s*"(Feature|FeatureCollection)"/,
  czml: /^\[\s*\{[\s\S]*"id"\s*:\s*"document"/,
  "3dtiles": /^\{[\s\S]*"asset"\s*:/
};

// Whether the sampled body plausibly holds data of the given format. When the
// whole body was read, JSON formats are fully parsed and their structure
// checked.
const looksValid = (
  format: UrlFormat,
  { text, complete }: { text: string; complete: boolean }
): boolean => {
  const body = text.replace(/^\uFEFF/, "").trim();
  if (!body) return false;
  switch (format) {
    case "geojson":
    case "czml":
    case "3dtiles":
      return complete
        ? JSON_STRUCTURE[format](parseJson(body))
        : JSON_PREFIX[format].test(body);
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

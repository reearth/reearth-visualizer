import { DataType } from "@reearth/core";

export type ValueFormat = Extract<DataType, "geojson" | "czml" | "kml">;

export const VALUE_FORMAT_LABEL: Record<ValueFormat, string> = {
  geojson: "GeoJSON",
  czml: "CZML",
  kml: "KML"
};

// Why a pasted value can't be added for the selected format.
export type ValueIssue =
  | { reason: "unrecognized" } // matches no supported format
  | { reason: "wrongFormat"; detected: ValueFormat } // valid, but another format
  | { reason: "invalid" }; // looks like the format but is malformed

const GEOJSON_TYPES = [
  "FeatureCollection",
  "Feature",
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
  "GeometryCollection"
];

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

// A known "type", and a "features" array for a FeatureCollection.
const isGeoJson = (json: unknown) =>
  isObject(json) &&
  GEOJSON_TYPES.includes(json.type as string) &&
  (json.type !== "FeatureCollection" || Array.isArray(json.features));

// An array of packet objects starting with the "document" packet. Other
// packets' ids are optional (Cesium generates one when missing).
const isCzml = (json: unknown) =>
  Array.isArray(json) &&
  isObject(json[0]) &&
  json[0].id === "document" &&
  json.every(isObject);

// Well-formed XML whose root element is <kml>.
const isKml = (text: string) => {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  return (
    !doc.getElementsByTagName("parsererror").length &&
    doc.documentElement.localName === "kml"
  );
};

// The format the value is a valid instance of, if any.
export const detectValueFormat = (value: string): ValueFormat | undefined => {
  const text = value.trim();
  if (text.startsWith("<")) return isKml(text) ? "kml" : undefined;
  const json = parseJson(text);
  if (isGeoJson(json)) return "geojson";
  if (isCzml(json)) return "czml";
  return undefined;
};

// Checks a pasted value against the selected format.
export const validateValue = (
  value: string,
  format: ValueFormat
): ValueIssue | undefined => {
  const text = value.trim();
  const detected = detectValueFormat(text);
  if (detected === format) return undefined;
  if (detected) return { reason: "wrongFormat", detected };

  // Not valid for any format: report it as broken data of the selected
  // format when it at least has that format's shape (JSON or XML).
  const looksLikeFormat =
    format === "kml" ? text.startsWith("<") : /^[[{]/.test(text);
  return looksLikeFormat ? { reason: "invalid" } : { reason: "unrecognized" };
};

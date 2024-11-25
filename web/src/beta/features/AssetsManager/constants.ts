export const IMAGE_FILE_TYPES = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "svg",
  "tiff",
  "webp"
] as const;

export const MODEL_FILE_TYPES = ["glb", "gltf"] as const;

export const GIS_FILE_TYPES = [
  "geojson",
  "topojson",
  "json",
  "csv",
  "shp",
  "kml",
  "kmz",
  "gpx",
  "wms",
  "mvt",
  "czml"
] as const;

export type ImageType = (typeof IMAGE_FILE_TYPES)[number];
export type GisType = (typeof GIS_FILE_TYPES)[number];
export type ModelType = (typeof MODEL_FILE_TYPES)[number];
export type FileType = ImageType | GisType | ModelType;

export type AcceptedAssetsTypes = ("image" | "file" | "model" | FileType)[];

export const IMAGE_FILE_TYPE_ACCEPT_STRING = "." + IMAGE_FILE_TYPES.join(",.");
export const GIS_FILE_TYPE_ACCEPT_STRING = "." + GIS_FILE_TYPES.join(",");
export const MODEL_FILE_TYPE_ACCEPT_STRING = "." + MODEL_FILE_TYPES.join(",");

export const GENERAL_FILE_TYPE_ACCEPT_STRING =
  "." +
  [...IMAGE_FILE_TYPES, ...GIS_FILE_TYPES, ...MODEL_FILE_TYPES].join(",.");

export const IMAGE_TYPES = ["image" as const];
export const FILE_TYPES = ["file" as const];
export const MODEL_TYPES = ["model" as const];
export const ALL_TYPES = [...IMAGE_TYPES, ...FILE_TYPES, ...MODEL_TYPES];

export const IMAGE_FILE_TYPES = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "svg",
  "tiff",
  "webp"
] as const;

export const GIS_FILE_TYPES = [
  "geojson",
  "topojson",
  "json",
  "glb",
  "gltf",
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
export type FileType = ImageType | GisType;

export type AcceptedAssetsTypes = ("image" | "file" | FileType)[];

export const IMAGE_FILE_TYPE_ACCEPT_STRING = "." + IMAGE_FILE_TYPES.join(",.");

export const GIS_FILE_TYPE_ACCEPT_STRING = "." + GIS_FILE_TYPES.join(",");

export const GENERAL_FILE_TYPE_ACCEPT_STRING =
  "." + [...IMAGE_FILE_TYPES, ...GIS_FILE_TYPES].join(",.");

export const IMAGE_TYPES = ["image" as const];
export const FILE_TYPES = ["file" as const];

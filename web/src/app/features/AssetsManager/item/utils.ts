import {
  GIS_FILE_TYPES,
  GisType,
  IMAGE_FILE_TYPES,
  ImageType
} from "../constants";
import { Asset } from "../types";

export function getAssetType(asset: Asset): "image" | "file" {
  const ext = asset.url.split(".").pop()?.toLowerCase();
  if (ext && IMAGE_FILE_TYPES.includes(ext as ImageType)) {
    return "image";
  }
  if (ext && GIS_FILE_TYPES.includes(ext as GisType)) {
    return "file";
  }
  return "file";
}

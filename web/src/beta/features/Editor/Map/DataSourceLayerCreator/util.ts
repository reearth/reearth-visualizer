import { generateRandomString } from "@reearth/beta/utils/string";

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const generateTitle = (url: string, layerName?: string): string => {
  if (layerName && layerName.trim() !== "") return layerName;
  if (isValidUrl(url)) {
    try {
      const urlObject = new URL(url);
      const pathParts = urlObject.pathname.split("/");
      const lastPart = pathParts.pop() || "";
      const fileName = lastPart.split(".")[0];
      return fileName;
    } catch (error) {
      console.error("Invalid URL", error);
    }
  }
  return generateRandomString(5);
};

import generateRandomString from "@reearth/beta/utils/generate-random-string";

export const generateTitle = (url: string, layerName?: string): string => {
  if (layerName && layerName.trim() !== "") return layerName;
  if (url.trim() !== "") {
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

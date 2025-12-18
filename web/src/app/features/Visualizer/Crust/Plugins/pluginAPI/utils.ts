export const openUrlInNewTab = (url: string): void => {
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    console.error("Invalid URL", url);
    return;
  }
  window.open(url, "_blank");
};

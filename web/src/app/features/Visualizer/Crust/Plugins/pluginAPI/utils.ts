const isSafeHttpUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const openUrlInNewTab = (url: string): void => {
  if (!url || typeof url !== "string" || !isSafeHttpUrl(url)) {
    console.error("Invalid URL", url);
    return;
  }
  window.open(url, "_blank", "noopener");
};

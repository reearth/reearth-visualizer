export const isValidUrl = (urlString: string | null | undefined): boolean => {
  if (!urlString) return false;
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
};

export const isSafeHttpUrl = (url: string): boolean => {
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

export const reloadCurrentWebPage = (): void => {
  window.location.reload();
};

export const isValidUrl = (urlString: string | null | undefined): boolean => {
  if (!urlString) return false;
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
};

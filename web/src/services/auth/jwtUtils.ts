export const base64UrlDecode = (input: string): string => {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const paddingNeeded = base64.length % 4;
  if (paddingNeeded) {
    base64 += "=".repeat(4 - paddingNeeded);
  }
  return atob(base64);
};

export const getJwtIat = (token: string): number | null => {
  try {
    const payload = JSON.parse(base64UrlDecode(token.split(".")[1]));
    return typeof payload.iat === "number" ? payload.iat : null;
  } catch {
    return null;
  }
};

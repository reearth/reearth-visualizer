export function normalizeUrl(url: string, ext: string): string {
  if (!url) return "";
  let u = url.replace("/%7Bz%7D", "/{z}").replace("/%7Bx%7D", "/{x}").replace("/%7By%7D", "/{y}");
  if (!u.includes("/{z}/{x}/{y}.")) {
    if (u[u.length - 1] !== "/") u += "/";
    u += "{z}/{x}/{y}." + ext;
  }

  return u;
}

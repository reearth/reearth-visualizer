import { UAParser } from "ua-parser-js";

export function isMobileDevice(uaString?: string): boolean {
  const { device } = UAParser(uaString || navigator.userAgent);
  // Treat tablets as mobile devices
  return device.is("mobile") || device.is("tablet");
}

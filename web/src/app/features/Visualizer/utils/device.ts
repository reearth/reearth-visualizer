import { UAParser } from "ua-parser-js";

export function isMobileDevice(uaString?: string): boolean {
  const { device } = UAParser(uaString || navigator.userAgent);
  return device.is("mobile");
}

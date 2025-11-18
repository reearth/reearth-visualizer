import Bowser from "bowser";

export type DeviceType = "mobile" | "desktop";

export function isMobileDevice(uaString?: string): boolean {
  const parser = Bowser.getParser(uaString || window.navigator.userAgent);
  const type = parser.getPlatformType(); // “desktop”, “mobile”, “tablet”, etc
  return type === "mobile";
}

export function getDeviceType(uaString?: string): DeviceType {
  return isMobileDevice(uaString) ? "mobile" : "desktop";
}

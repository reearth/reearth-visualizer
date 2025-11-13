import Bowser from "bowser";

export type DeviceType = "mobile" | "desktop";

export function isMobileDevice(): boolean {
  const parser = Bowser.getParser(window.navigator.userAgent);
  const type = parser.getPlatformType(); // “desktop”, “mobile”, “tablet”, etc
  return type === "mobile" || type === "tablet";
}

export function getDeviceType(): DeviceType {
  return isMobileDevice() ? "mobile" : "desktop";
}

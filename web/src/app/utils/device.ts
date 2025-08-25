import { UAParser } from "ua-parser-js";

export type DeviceType = "mobile" | "desktop";

export function isMobileDevice(uaString?: string): boolean {
  const { device } = UAParser(uaString || navigator.userAgent);
  return device.is("mobile");
}

export function getDeviceType(uaString?: string): DeviceType {
  return isMobileDevice(uaString) ? "mobile" : "desktop";
}

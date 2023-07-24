import { GoogleMaps as CesiumGoogleMaps } from "cesium";

export type GoogleMaps = typeof CesiumGoogleMaps & {
  getDefaultApiKeyCredit: (providedKey: string) => string;
};

import { Viewer } from "cesium";
import "./config";

declare global {
  interface Window {
    REEARTH_E2E_ACCESS_TOKEN?: string;
    REEARTH_E2E_CESIUM_VIEWER?: Viewer;
    React?: any;
    ReactDOM?: any;
  }
}

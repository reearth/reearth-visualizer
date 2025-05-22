import { useT } from "@reearth/services/i18n";
import { useMemo } from "react";

export default () => {
  const t = useT();

  const categoryTitles: Record<string, string> = useMemo(() => {
    return {
      custom: t("Custom"),
      ui: t("User Interface"),
      data: t("Data"),
      viewerScene: t("Viewer & Scene Settings"),
      layers: t("Manage Layer"),
      layerStyles: t("Manage Layer Style"),
      camera: t("Camera"),
      timeline: t("Timeline")
    };
  }, [t]);

  const pluginTitles: Record<string, string> = useMemo(() => {
    return {
      "my-plugin": t("My Plugin"),
      "responsive-panel": t("Responsive Panel"),
      sidebar: t("Sidebar"),
      header: t("Header"),
      "popup-plugin": t("Popup"),
      "modal-window": t("Modal Window"),
      "messenger-between-extension-and-visualizer": t(
        "Messenger Between Extension and Visualizer"
      ),
      "messenger-between-extensions": t("Messenger Between Extensions"),
      "enable-shadow-style": t("Enable Shadow Style"),
      "enable-terrain": t("Enable Terrain"),
      "show-label": t("Show Label"),
      "take-screenshot": t("Take Screenshot"),
      "mouse-events": t("Mouse Events"),
      "add-geojson": t("Add GeoJSON"),
      "add-large-geojson": t("Add Large Geojson"),
      "add-csv": t("Add CSV"),
      "add-kml": t("Add KML"),
      "add-wms": t("Add WMS"),
      "add-czml": t("Add CZML"),
      "add-3d-tiles": t("Add 3D Tiles"),
      "add-photogrammetric-3D-model": t("Add Photogrammetric 3D model"),
      "add-point-cloud": t("Add Point Cloud"), 
      "add-google-photorealistic-3d-tiles": t(
        "Add Google Photorealistic 3D Tiles"
      ),
      "add-infobox-all-properties": t("Add infobox to show all properties"),
      "add-infobox-specific-properties": t(
        "Add infobox to show specific properties"
      ),
      "add-infobox-rich-block": t("Add infobox to show rich blocks"),
      "add-osm-3d-tiles": t("Add OSM 3D Tiles"),
      "hide-fly-to-delete-layer": t("Hide Fly To Delete Layer"),
      "override-layer-data": t("Override Layer Data"),
      "show-selected-features-info": t("Show Selected Features Information"),
      "layer-styling-examples": t("Layer Styling Examples"),
      "feature-style-3d-model": t("Feature Style 3D Model"),
      "feature-style-3d-tiles": t("Feature Style 3D Tiles"),
      "filter-features-with-style": t("Filter Features by Style"),
      "override-style": t("Override Style"),
      "style-with-condition": t("Style With Condition"),
      "playback-control": t("Playback Control"),
      "time-driven-features": t("Time Driven Features"),
      "time-driven-path": t("Time Driven Path"),
      "client-storage-theme-selector": t("Client Storage"),
      "extension-property": t("Extension Property"),
      "zoom-in-out": t("Zoom In Out"),
      "camera-rotation": t("Camera Rotation"),
      "camera-position": t("Camera Position"),
      "shared-plugin-id": t("Shared Plugin") // NOTE: needed to hardcode this part to help translation
    };
  }, [t]);

  return {
    categoryTitles,
    pluginTitles
  };
};

import { PluginType } from "../constants";

import { cameraPosition } from "./camera/cameraPosition";
import { cameraRotation } from "./camera/cameraRotation";
import { zoomInOut } from "./camera/zoomInOut";
import { extensionExtensionMessenger } from "./communication/extensionExtensionMessenger";
import { uiExtensionMessenger } from "./communication/uiExtensionMessenger";
import { myPlugin } from "./custom/myPlugin";
import { extensionProperty } from "./extension/extensionProperty";
import { add3dTiles } from "./layers/add-3Dtiles";
import { addCsv } from "./layers/add-csv";
import { addCzml } from "./layers/add-czml";
import { addGeojson } from "./layers/add-geojson";
import { addGooglePhotorealistic3dTiles } from "./layers/add-google-photorealistic-3d-tiles";
import { addKml } from "./layers/add-kml";
import { addOsm3dTiles } from "./layers/add-OSM-3DTiles";
import { addWms } from "./layers/add-wms";
import { hideFlyToDeleteLayer } from "./layers/hideFlyToDeleteLayer";
import { overrideLayerData } from "./layers/overrideLayerData";
import { showFeaturesInfo } from "./layers/showSelectedFeaturesInformation";
import { layerStylingExamples } from "./layerStyles/layerStylingExamples";
import { featureStyle3dModel } from "./manageLayerStyle/featureStyle3dmodel";
import { featureStyle3dTiles } from "./manageLayerStyle/featureStyle3dTiles";
import { filterFeatureWithStyle } from "./manageLayerStyle/filterFeaturebyStyle";
import { overrideStyle } from "./manageLayerStyle/overrideStyle";
import { styleWithCondition } from "./manageLayerStyle/styleWithCondition";
import { playbackControl } from "./timeline/playbackControl";
import { timeDrivenFeatures } from "./timeline/timeDrivenFeatures";
import { timeDrivenPath } from "./timeline/timeDrivenPath";
import { enableShadowStyle } from "./viewerAndSceneSettings/enableShadowStyle";
import { enableTerrain } from "./viewerAndSceneSettings/enableTerrain";
import { showLabel } from "./viewerAndSceneSettings/showLabel";
import { takeScreenshot } from "./viewerAndSceneSettings/takeScreenshot";
import { header } from "./ui/header";
import { responsivePanel } from "./ui/responsivePanel";
import { sidebar } from "./ui/sidebar";

type PresetPluginCategory = {
  id: string;
  title: string;
  plugins: PluginType[];
};

export type PresetPlugins = PresetPluginCategory[];

export const presetPlugins: PresetPlugins = [
  {
    id: "custom",
    title: "Custom",
    plugins: [myPlugin]
  },
  {
    id: "ui",
    title: "User Interface",
    plugins: [responsivePanel, sidebar, header]
  },
  {
    id: "communication",
    title: "Communication",
    plugins: [uiExtensionMessenger, extensionExtensionMessenger]
  },
  {
    id: "viewerScene",
    title: "Viewer & Scene Settings",
    plugins: [enableShadowStyle,enableTerrain,showLabel,takeScreenshot]
  },
  {
    id: "layers",
    title: "Manage Layer",
    plugins: [
      addGeojson,
      addCzml,
      addKml,
      addCsv,
      add3dTiles,
      addOsm3dTiles,
      addWms,
      addGooglePhotorealistic3dTiles,
      hideFlyToDeleteLayer,
      overrideLayerData,
      showFeaturesInfo
    ]
  },
  {
    id: "layerStyles",
    title: "Manage Layer Style",
    plugins: [
      layerStylingExamples,
      featureStyle3dTiles,
      featureStyle3dModel,
      overrideStyle,
      styleWithCondition,
      filterFeatureWithStyle
    ]
  },
  {
    id: "camera",
    title: "Camera",
    plugins: [zoomInOut, cameraRotation, cameraPosition]
  },
  {
    id: "timeline",
    title: "Timeline",
    plugins: [playbackControl,timeDrivenFeatures,timeDrivenPath]
  },
  {
    id: "dataStorage",
    title: "Data Storage",
    plugins: []
  },
  {
    id: "extension",
    title: "Extension",
    plugins: [extensionProperty]
  },
  {
    id: "sketch",
    title: "Sketch",
    plugins: []
  }
];

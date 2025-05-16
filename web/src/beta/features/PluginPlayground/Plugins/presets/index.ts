import { PluginType } from "../constants";

import { cameraPosition } from "./camera/cameraPosition";
import { cameraRotation } from "./camera/cameraRotation";
import { zoomInOut } from "./camera/zoomInOut";
import { myPlugin } from "./custom/myPlugin";
import { clientStorageThemeSelector } from "./data/clientStorageThemeSelector";
import { extensionProperty } from "./data/extensionProperty";
import { messengerBetweenExtensions } from "./data/messengerBetweenExtensions";
import { uiExtensionMessenger } from "./data/uiExtensionMessenger";
import { add3dTiles } from "./layers/add-3Dtiles";
import { addCsv } from "./layers/add-csv";
import { addCzml } from "./layers/add-czml";
import { addGeojson } from "./layers/add-geojson";
import { addGooglePhotorealistic3dTiles } from "./layers/add-google-photorealistic-3d-tiles";
import { addKml } from "./layers/add-kml";
import { addOsm3dTiles } from "./layers/add-OSM-3DTiles";
import { addWms } from "./layers/add-wms";
import { addInfoboxAllProperties } from "./layers/addInfoboxAllProperties";
import { hideFlyToDeleteLayer } from "./layers/hideFlyToDeleteLayer";
import { overrideLayerData } from "./layers/overrideLayerData";
import { showFeaturesInfo } from "./layers/showSelectedFeaturesInformation";
import { featureStyle3dModel } from "./layerStyles/featureStyle3dmodel";
import { featureStyle3dTiles } from "./layerStyles/featureStyle3dTiles";
import { filterFeatureWithStyle } from "./layerStyles/filterFeaturebyStyle";
import { layerStylingExamples } from "./layerStyles/layerStylingExamples";
import { overrideStyle } from "./layerStyles/overrideStyle";
import { styleWithCondition } from "./layerStyles/styleWithCondition";
import { playbackControl } from "./timeline/playbackControl";
import { timeDrivenFeatures } from "./timeline/timeDrivenFeatures";
import { timeDrivenPath } from "./timeline/timeDrivenPath";
import { header } from "./ui/header";
import { modalWindow } from "./ui/modalWindow";
import { popupPlugin } from "./ui/popup";
import { responsivePanel } from "./ui/responsivePanel";
import { sidebar } from "./ui/sidebar";
import { enableShadowStyle } from "./viewer/enableShadowStyle";
import { enableTerrain } from "./viewer/enableTerrain";
import { mouseEvents } from "./viewer/mouseEvent";
// import { showLabel } from "./viewer/showLabel";
import { takeScreenshot } from "./viewer/takeScreenshot";

type PresetPluginCategory = {
  id: string;
  plugins: PluginType[];
};

export type PresetPlugins = PresetPluginCategory[];
export const presetPlugins: PresetPlugins = [
  {
    id: "custom",
    plugins: [myPlugin]
  },
  {
    id: "ui",
    plugins: [responsivePanel, sidebar, header, modalWindow, popupPlugin]
  },
  {
    id: "data",
    plugins: [
      uiExtensionMessenger,
      messengerBetweenExtensions,
      extensionProperty,
      clientStorageThemeSelector
    ]
  },
  {
    id: "viewerScene",
    plugins: [
      enableShadowStyle,
      enableTerrain,
      // showLabel, NOTE: ommitting this plugin as could cause issue with client requesting for the feature in another plugin
      takeScreenshot,
      mouseEvents
    ]
  },
  {
    id: "layers",
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
      showFeaturesInfo,
      addInfoboxAllProperties
    ]
  },
  {
    id: "layerStyles",
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
    plugins: [zoomInOut, cameraRotation, cameraPosition]
  },
  {
    id: "timeline",
    plugins: [playbackControl, timeDrivenFeatures, timeDrivenPath]
  }
];

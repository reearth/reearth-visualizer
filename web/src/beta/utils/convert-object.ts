export type Mapping = Record<string, string | [string, Record<string, string>]>;
type AnyObject = Record<string, any>;

// Helper function to get nested property value
function getNestedProperty(obj: AnyObject, keys: string[]): any {
  return keys.reduce((acc, key) => (acc?.[key] !== undefined ? acc[key] : undefined), obj);
}

// Helper function to set nested properties
function setNestedProperty(obj: AnyObject, keys: string[], value: any): void {
  const lastKey = keys.pop();
  if (!lastKey) return;
  const lastObj = keys.reduce((acc, key) => (acc[key] = acc[key] || {}), obj);
  lastObj[lastKey] = value;
}

// Function to check if a value is an object
function isObject(value: any): value is AnyObject {
  return value && typeof value === "object" && !Array.isArray(value);
}

// Function to check if a value is an array
function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

// Conversion function
export function convertData(source: AnyObject, mapping: Mapping): AnyObject {
  const target: AnyObject = {};

  for (const [sourceKey, targetKey] of Object.entries(mapping)) {
    const sourceKeys = sourceKey.split(".");
    const value = getNestedProperty(source, sourceKeys);

    if (value !== undefined) {
      if (isArray(value) && typeof targetKey === "object") {
        const convertedArray = value.map(item =>
          isObject(item) ? convertData(item, targetKey[1]) : item,
        );
        const targetKeys = targetKey[0].split(".");
        setNestedProperty(target, targetKeys, convertedArray);
      } else if (typeof targetKey === "string") {
        const targetKeys = targetKey.split(".");
        setNestedProperty(target, targetKeys, value);
      }
    }
  }

  return target;
}

// Convert those been defined in backend only
// Remember to update when cesium-beta schema changes
export const sceneProperty2ViewerPropertyMapping: Mapping = {
  "default.sceneMode": "scene.mode",
  "default.vr": "scene.vr",
  tiles: [
    "tiles",
    {
      id: "id",
      tile_type: "type",
      tile_url: "url",
      tile_zoomLevel: "zoomLevel",
      tile_zoomLevelForURL: "zoomLevelForURL",
      tile_opacity: "opacity",
      heatmap: "heatmap",
    },
  ],
  "terrain.terrain": "terrain.enabled",
  "terrain.terrainType": "terrain.type",
  "terrain.terrainCesiumIonAsset": "assets.cesium.terrain.ionAsset",
  "terrain.terrainCesiumIonAccessToken": "assets.cesium.terrain.ionAccessToken",
  "terrain.terrainCesiumIonUrl": "assets.cesium.terrain.ionUrl",
  "terrain.terrainExaggeration": "scene.verticalExaggeration",
  "terrain.terrainExaggerationRelativeHeight": "scene.verticalExaggerationRelativeHeight",
  "terrain.depthTestAgainstTerrain": "globe.depthTestAgainstTerrain",
  "globeLighting.globeLighting": "globe.enableLighting",
  "globeShadow.globeShadow": "scene.shadow.enabled",
  "globeAtmosphere.globeAtmosphere": "globe.atmosphere.enabled",
  "globeAtmosphere.globeAtmosphereIntensity": "globe.atmosphere.intensity",
  "skyBox.skyBox": "sky.skyBox.show",
  "sun.sun": "sky.sun.show",
  "moon.moon": "sky.moon.show",
  "skyAtmosphere.skyAtmosphere": "sky.atmosphere.show",
  "skyAtmosphere.skyAtmosphereIntensity": "sky.atmosphere.lightIntensity",
  "camera.camera": "camera.camera",
  "camera.allowEnterGround": "camera.allowEnterGround",
};

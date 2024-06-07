// This SceneProperty type is from backend.
// Currently including the legacy properties.
// TODO: remove legacy properties.

type TerrainProperty = {
  terrain?: boolean;
  terrainType?: "cesium" | "arcgis" | "cesiumion"; // default: cesium
  terrainCesiumIonAsset?: string;
  terrainCesiumIonAccessToken?: string;
  terrainCesiumIonUrl?: string;
  terrainExaggeration?: number; // default: 1
  terrainExaggerationRelativeHeight?: number; // default: 0
  depthTestAgainstTerrain?: boolean;
};

type SceneMode = "3d" | "2d" | "columbus"; // default: scene3d
type IndicatorTypes = "default" | "crosshair" | "custom";

type Camera = {
  lat: number;
  lng: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
  fov: number;
  aspectRatio?: number;
};

export type SceneProperty = {
  default?: {
    sceneMode?: SceneMode;
    ion?: string;
    vr?: boolean;
  };
  tiles?: {
    id: string;
    tile_type?: string;
    tile_url?: string;
    tile_zoomLevel?: number[];
    tile_zoomLevelForURL?: number[];
    tile_opacity?: number;
    heatmap?: boolean;
  }[];
  tileLabels?: {
    id: string;
    labelType: "japan_gsi_optimal_bvmap"; // | "other_map"
    style: Record<string, any>; // Function isn't allowed
  }[];
  terrain?: TerrainProperty;
  globeLighting?: {
    globeLighting?: boolean;
  };
  globeShadow?: {
    globeShadow?: boolean;
  };
  globeAtmosphere?: {
    globeAtmosphere?: boolean;
    globeAtmosphereIntensity?: number; // default: 10
  };
  skyBox?: {
    skyBox?: boolean;
  };
  sun?: {
    sun?: boolean;
  };
  moon?: {
    moon?: boolean;
  };
  skyAtmosphere?: {
    skyAtmosphere?: boolean;
    skyAtmosphereIntensity?: number; // default: 50
  };
  camera?: {
    camera?: Camera;
    allowEnterGround?: boolean;
    fov?: number;
  };
  render?: { showWireframe?: boolean };
} & LegacySceneProperty;

type LegacySceneProperty = {
  default?: {
    camera?: Camera;
    allowEnterGround?: boolean;
    skybox?: boolean;
    bgcolor?: string;
    ion?: string;
    sceneMode?: "3d" | "2d" | "columbus"; // default: scene3d
    vr?: boolean;
  } & TerrainProperty; // compat
  cameraLimiter?: {
    cameraLimitterEnabled?: boolean;
    cameraLimitterShowHelper?: boolean;
    cameraLimitterTargetArea?: Camera;
    cameraLimitterTargetWidth?: number;
    cameraLimitterTargetLength?: number;
  };
  indicator?: {
    indicator_type: IndicatorTypes;
    indicator_image?: string;
    indicator_image_scale?: number;
  };
  tiles?: {
    id: string;
    tile_type?: string;
    tile_url?: string;
    tile_zoomLevel?: number[];
    tile_opacity?: number;
  }[];
  terrain?: {
    terrain?: boolean;
    terrainType?: "cesium" | "arcgis" | "cesiumion"; // default: cesium
    terrainExaggeration?: number; // default: 1
    terrainExaggerationRelativeHeight?: number; // default: 0
    depthTestAgainstTerrain?: boolean;
    terrainCesiumIonAsset?: string;
    terrainCesiumIonAccessToken?: string;
    terrainCesiumIonUrl?: string;
    terrainUrl?: string;
    terrainNormal?: boolean;
    // TODO: Add encode option
    // Need to specify a tile from `tiles` option with `heatmap` option.
    heatmapType?: "custom"; // TODO: Support Cesium's terrain heatmap as built-in: https://sandcastle.cesium.com/?src=Globe%20Materials.html
    heatmapColorLUT?: [number, number, number];
    heatmapMinHeight?: number;
    heatmapMaxHeight?: number;
    heatmapLogarithmic?: boolean;
  };
  atmosphere?: {
    enable_sun?: boolean;
    enableMoon?: boolean;
    enable_lighting?: boolean;
    ground_atmosphere?: boolean;
    sky_atmosphere?: boolean;
    shadows?: boolean;
    shadowResolution?: 1024 | 2048 | 4096;
    softShadow?: boolean;
    shadowDarkness?: number;
    shadowMaximumDistance?: number;
    fog?: boolean;
    fog_density?: number;
    hue_shift?: number;
    brightness_shift?: number;
    surturation_shift?: number;
    skyboxBrightnessShift?: number;
    skyboxSurturationShift?: number;
    globeShadowDarkness?: number;
    globeImageBasedLighting?: boolean;
    globeBaseColor?: string;
  };
  timeline?: {
    animation?: boolean;
    visible?: boolean;
    current?: string;
    start?: string;
    stop?: string;
    stepType?: "rate" | "fixed";
    multiplier?: number;
    step?: number;
    rangeType?: "unbounded" | "clamped" | "bounced";
  };
  googleAnalytics?: {
    enableGA?: boolean;
    trackingId?: string;
  };
  theme?: {
    themeType?: "light" | "dark" | "forest" | "custom";
    themeTextColor?: string;
    themeSelectColor?: string;
    themeBackgroundColor?: string;
  };
  ambientOcclusion?: {
    enabled?: boolean;
    quality?: "low" | "medium" | "high" | "extreme";
    intensity?: number;
    ambientOcclusionOnly?: boolean;
  };
  light?: {
    lightType?: "sunLight" | "directionalLight";
    lightDirectionX?: number;
    lightDirectionY?: number;
    lightDirectionZ?: number;
    lightColor?: string;
    lightIntensity?: number;
    specularEnvironmentMaps?: string;
    sphericalHarmonicCoefficients?: [x: number, y: number, z: number][];
    imageBasedLightIntensity?: number;
  };
  render?: {
    antialias?: "low" | "medium" | "high" | "extreme";
    debugFramePerSecond?: boolean;
  };
};

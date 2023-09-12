export default {
  groups: [
    {
      id: "default",
      title: "Scene",
      fields: [
        {
          id: "camera",
          type: "camera",
          title: "Initial camera position",
          description: "The starting position of your project.",
        },
        {
          id: "allowEnterGround",
          type: "bool",
          title: "Enter the ground",
          defaultValue: false,
          description: "Set to true to allow the camera to enter the surface of the earth.",
        },
        {
          id: "sceneMode",
          type: "string",
          title: "Scene mode",
          description: "Specify scene mode.",
          defaultValue: "3d",
          choices: [
            {
              key: "3d",
              label: "Scene 3D",
            },
            {
              key: "2d",
              label: "Scene 2D",
            },
            {
              key: "columbus",
              label: "Columbus View",
            },
          ],
        },
        {
          id: "skybox",
          type: "bool",
          title: "Sky",
          defaultValue: true,
          description: "Show the stars.",
        },
        {
          id: "bgcolor",
          type: "string",
          title: "Background color",
          description: "With Sky disabled, choose a background color.",
          ui: "color",
        },
        {
          id: "ion",
          type: "string",
          title: "Cesium Ion API access token",
          description:
            "Cesium Ion account users may use their personal API keys to be able to use their Cesium Ion assets(tile data, 3D data, etc) with their project.",
        },
        {
          id: "vr",
          type: "bool",
          title: "VR",
          description: "Enable VR mode to split the screen into left and right.",
        },
      ],
    },
    {
      id: "tiles",
      title: "Tiles",
      description:
        "You may change the look of the Earth by obtaining map tile data and setting it here.",
      list: true,
      representativeField: "tile_type",
      fields: [
        {
          id: "tile_type",
          type: "string",
          title: "Tile type",
          defaultValue: "default",
          choices: [
            {
              key: "default",
              label: "Default",
            },
            {
              key: "default_label",
              label: "Labelled",
            },
            {
              key: "default_road",
              label: "Road Map",
            },
            {
              key: "stamen_watercolor",
              label: "Stamen Watercolor",
            },
            {
              key: "stamen_toner",
              label: "Stamen Toner",
            },
            {
              key: "open_street_map",
              label: "OpenStreetMap",
            },
            {
              key: "esri_world_topo",
              label: "ESRI Topography",
            },
            {
              key: "black_marble",
              label: "Earth at night",
            },
            {
              key: "japan_gsi_standard",
              label: "Japan GSI Standard Map",
            },
            {
              key: "url",
              label: "URL",
            },
          ],
        },
        {
          id: "tile_url",
          type: "string",
          title: "Tile map URL",
          availableIf: {
            field: "tile_type",
            type: "string",
            value: "url",
          },
        },
        {
          id: "tile_minLevel",
          type: "number",
          title: "Minimum zoom level",
          min: 0,
          max: 30,
        },
        {
          id: "tile_maxLevel",
          type: "number",
          title: "Maximum zoom level",
          min: 0,
          max: 30,
        },
        {
          id: "tile_opacity",
          type: "number",
          title: "Opacity",
          description: "Change the opacity of the selected tile map. Min: 0 Max: 1",
          defaultValue: 1,
          ui: "slider",
          min: 0,
          max: 1,
        },
      ],
    },
    {
      id: "terrain",
      title: "Terrain",
      fields: [
        {
          id: "terrain",
          type: "bool",
          title: "Terrain",
          description: "Show elevation when close to the surface.",
        },
        {
          id: "terrainType",
          type: "string",
          title: "Terrain type",
          description: "Specify terrain type.",
          defaultValue: "cesium",
          choices: [
            {
              key: "cesium",
              label: "Cesium World Terrain",
            },
            {
              key: "arcgis",
              label: "ArcGIS Terrain",
            },
            {
              key: "cesiumion",
              label: "Cesium Ion",
            },
          ],
        },
        {
          id: "terrainCesiumIonAsset",
          type: "string",
          title: "Terrain Cesium Ion asset ID",
          description: "Specify the ID of a terrain asset registered on Cesium Ion.",
          availableIf: {
            field: "terrainType",
            type: "string",
            value: "cesiumion",
          },
        },
        {
          id: "terrainCesiumIonAccessToken",
          type: "string",
          title: "Terrain Cesium Ion access token",
          description:
            "Specify a Cesium Ion access token if you want to override the access token in the scene-wide settings for this tile.",
          availableIf: {
            field: "terrainType",
            type: "string",
            value: "cesiumion",
          },
        },
        {
          id: "terrainCesiumIonUrl",
          type: "string",
          title: "Terrain URL",
          description:
            "Specify the URL of Cesium's terrain server if it is delivered on-premises rather than Cesum Ion. This takes precedence over the asset ID setting.",
          availableIf: {
            field: "terrainType",
            type: "string",
            value: "cesiumion",
          },
        },
        {
          id: "terrainExaggeration",
          type: "number",
          title: "Terrain exaggeration",
          description:
            "A scalar used to exaggerate the terrain. Defaults to 1.0 (no exaggeration). A value of 2.0 scales the terrain by 2x. A value of 0.0 makes the terrain completely flat.",
          defaultValue: 1,
          suffix: "x",
        },
        {
          id: "terrainExaggerationRelativeHeight",
          type: "number",
          title: "Terrain exaggeration relative height",
          description:
            "The height from which terrain is exaggerated. Defaults to 0.0. Terrain that is above this height will scale upwards and terrain that is below this height will scale downwards.",
          defaultValue: 0,
          suffix: "m",
        },
        {
          id: "depthTestAgainstTerrain",
          type: "bool",
          title: "Hide objects under terrain",
          description:
            "Hides objects under the terrain. Depending on the loading status of the terrain, objects may be shown or hidden.",
        },
      ],
    },
    {
      id: "indicator",
      title: "Indicator",
      description: "Set the style of indicator shown when selecting a layer on the map.",
      fields: [
        {
          id: "indicator_type",
          type: "string",
          title: "Type",
          defaultValue: "default",
          description: "Choose how the indicator will look.",
          choices: [
            {
              key: "default",
              label: "Default",
            },
            {
              key: "crosshair",
              label: "Crosshair",
            },
            {
              key: "custom",
              label: "Custom",
            },
          ],
        },
        {
          id: "indicator_image",
          type: "url",
          title: "Image URL",
          ui: "image",
          availableIf: {
            field: "indicator_type",
            type: "string",
            value: "custom",
          },
        },
        {
          id: "indicator_image_scale",
          type: "number",
          title: "Image scale",
          availableIf: {
            field: "indicator_type",
            type: "string",
            value: "custom",
          },
        },
      ],
    },
    {
      id: "theme",
      title: "Publish Theme",
      description: "Set your theme.",
      fields: [
        {
          id: "themeType",
          type: "string",
          title: "Theme",
          defaultValue: "dark",
          description: "Select the theme.",
          choices: [
            {
              key: "dark",
              label: "Re:Earth Dark",
            },
            {
              key: "light",
              label: "Re:Earth Light",
            },
            {
              key: "forest",
              label: "Forest",
            },
            {
              key: "custom",
              label: "Custom theme",
            },
          ],
        },
        {
          id: "themeTextColor",
          type: "string",
          ui: "color",
          title: "Text color",
          description: "Select a color.",
          defaultValue: "#434343",
          availableIf: {
            field: "themeType",
            type: "string",
            value: "custom",
          },
        },
        {
          id: "themeSelectColor",
          type: "string",
          ui: "color",
          title: "Select color",
          description: "Select a color.",
          defaultValue: "#C52C63",
          availableIf: {
            field: "themeType",
            type: "string",
            value: "custom",
          },
        },
        {
          id: "themeBackgroundColor",
          type: "string",
          ui: "color",
          title: "Background color",
          description: "Select a color.",
          defaultValue: "#DFE5F0",
          availableIf: {
            field: "themeType",
            type: "string",
            value: "custom",
          },
        },
      ],
    },
    {
      id: "atmosphere",
      title: "Atmospheric Conditions",
      description: "Set the look and feel of the Earth.",
      fields: [
        {
          id: "enable_sun",
          type: "bool",
          title: "Sun",
          defaultValue: true,
          description: "Display the Sun.",
        },
        {
          id: "enable_lighting",
          type: "bool",
          title: "Lighting",
          defaultValue: false,
          description: "Display natural lighting from the sun.",
        },
        {
          id: "ground_atmosphere",
          type: "bool",
          title: "Ground atmosphere",
          defaultValue: true,
          description: "Display a lower atmospheric layer.",
        },
        {
          id: "sky_atmosphere",
          type: "bool",
          title: "Sky atmosphere",
          defaultValue: true,
          description: "Display an upper atmospheric layer.",
        },
        {
          id: "shadows",
          type: "bool",
          title: "Shadow",
          description:
            "Display shadows on the Earth. Shadows for each layers should be also enabled to see them.",
        },
        {
          id: "fog",
          type: "bool",
          title: "Fog",
          defaultValue: true,
          description: "Display customizable fog.",
        },
        {
          id: "fog_density",
          type: "number",
          title: "Fog density",
          defaultValue: 0.0002,
          description: "Set a thickness to the fog. Min: 0 Max: 1",
          min: 0,
          max: 1,
        },
        {
          id: "brightness_shift",
          type: "number",
          title: "Fog brightness",
          defaultValue: 0.03,
          description: "Set brightness of the fog. Min: -1 Max: 1",
          min: -1,
          max: 1,
        },
        {
          id: "hue_shift",
          type: "number",
          title: "Fog hue",
          description: "Set hue of the fog. Min: -1 Max: 1",
          min: -1,
          max: 1,
        },
        {
          id: "surturation_shift",
          type: "number",
          title: "Fog saturation",
          description: "Set saturation of the fog. Min: -1 Max: 1",
          min: -1,
          max: 1,
        },
      ],
    },
    {
      id: "timeline",
      title: "Timeline",
      fields: [
        {
          id: "animation",
          type: "bool",
          title: "Animation",
          defaultValue: false,
          description: "Enables animation play. If enabled, each 3D models can animate.",
        },
        {
          id: "visible",
          type: "bool",
          title: "Timeline",
          description: "Whether the timeline UI is displayed or not",
        },
        {
          id: "current",
          type: "string",
          title: "Current time",
          ui: "datetime",
        },
        {
          id: "start",
          type: "string",
          title: "Start time",
          description:
            "If nothing is set, it will be set automatically according to the data being displayed.",
          ui: "datetime",
        },
        {
          id: "stop",
          type: "string",
          title: "Stop time",
          description:
            "If nothing is set, it will be set automatically according to the data being displayed.",
          ui: "datetime",
        },
        {
          id: "stepType",
          type: "string",
          title: "Tick type",
          defaultValue: "rate",
          description: "How to specify the playback speed",
          choices: [
            {
              key: "rate",
              label: "Rate",
            },
            {
              key: "fixed",
              label: "Fixed",
            },
          ],
        },
        {
          id: "multiplier",
          type: "number",
          title: "Multiplier",
          description:
            "Specifies the playback speed as a multiple of the real time speed. Negative values can also be specified. Default is 1x.",
          defaultValue: 1,
          prefix: "x",
          availableIf: {
            field: "stepType",
            type: "string",
            value: "rate",
          },
        },
        {
          id: "step",
          type: "number",
          title: "Step",
          description:
            "Specifies the playback speed in seconds. Each time the screen is repeatedly drawn, it advances by the specified specified number of seconds. Negative values can also be specified. The default is 1 second.",
          defaultValue: 1,
          suffix: "s",
          availableIf: {
            field: "stepType",
            type: "string",
            value: "fixed",
          },
        },
        {
          id: "rangeType",
          type: "string",
          title: "Range",
          description:
            "Specifies the playback speed in seconds. Negative values can also be specified.",
          defaultValue: "unbounded",
          choices: [
            {
              key: "unbounded",
              label: "Unbounded",
            },
            {
              key: "clamped",
              label: "Clamped",
            },
            {
              key: "bounced",
              label: "Bounced",
            },
          ],
        },
      ],
    },
    {
      id: "cameraLimiter",
      title: "Camera Limiter",
      description: "Set the camera limiting box.",
      fields: [
        {
          id: "cameraLimitterEnabled",
          type: "bool",
          title: "Enable",
          defaultValue: false,
          description: "Enable camera limiter.",
        },
        {
          id: "cameraLimitterShowHelper",
          type: "bool",
          title: "Show helper",
          defaultValue: false,
          description: "Display the limiter boundaries.",
        },
        {
          id: "cameraLimitterTargetArea",
          type: "camera",
          title: "Target max height",
          description:
            "The base position of the camera movement range. This position is the center point of the limit box in the horizontal and depth directions, and is the maximum height of the movable range. The camera will not be able to zoom out beyond the height specified here.",
        },
        {
          id: "cameraLimitterTargetWidth",
          type: "number",
          title: "Target width",
          description:
            "Specifies the width (longitude direction) of the box that represents the limiter boundaries.",
          min: 5,
          defaultValue: 1000000,
          suffix: "m",
        },
        {
          id: "cameraLimitterTargetLength",
          type: "number",
          title: "Target length",
          description:
            "Specifies the depth (latitude direction) of the box that represents the limiter boundaries.",
          min: 5,
          defaultValue: 1000000,
          suffix: "m",
        },
      ],
    },
    {
      id: "googleAnalytics",
      title: "Google Analytics",
      description:
        "Set your Google Analytics tracking ID and analyze how your published project is being viewed.",
      fields: [
        {
          id: "enableGA",
          type: "bool",
          title: "Enable",
          defaultValue: false,
          description: "Enable Google Analytics",
        },
        {
          id: "trackingId",
          type: "string",
          title: "Tracking ID",
          description:
            "Paste your Google Analytics tracking ID here. This will be embedded in your published project.",
        },
      ],
    },
    {
      id: "experimental",
      title: "Advanced",
      fields: [
        {
          id: "experimental_core",
          type: "bool",
          title: "Enable advanced features",
          defaultValue: false,
          description: "Enable advanced features for this scene. (beta)",
        },
        {
          id: "experimental_sandbox",
          type: "bool",
          title: "Enable sandbox (alpha)",
          defaultValue: false,
          description: "Enable sandbox for plugin iframes. (alpha)",
        },
      ],
    },
  ],
};

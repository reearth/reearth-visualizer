import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layer-styling-examples-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layer-styling-examples-plugin
name: Layer Styling Examples
version: 1.0.0
extensions:
  - id: layer-styling-examples
    type: widget
    name: Layer Styling Examples
    description: Examples of styling different layer formats (GeoJSON, CZML, KML)
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layer-styling-examples",
  title: "layer-styling-examples.js",
  sourceCode: `
  // ==================================
  // GeoJSON Layer (West Area)
  // ==================================
  const geojsonLayer = {
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "FeatureCollection",
      features: [
        // Point Feature (North)
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [139.600, 35.8309591]
          }
        },
        // Line Feature (Middle)
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [139.600, 35.7833277],
              [139.600, 35.7507895]
            ]
          }
        },
        // Polygon Feature (South)
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [139.580, 35.7109591],
              [139.600, 35.7300069],
              [139.620, 35.6900069],
              [139.580, 35.7109591]
            ]]
          }
        }
      ]
    }
  },
  marker: {
    style: "point",
    pointColor: "#FF4444",
    pointSize: 15,
    pointOutlineColor: "white",
    pointOutlineWidth: 2
  },
  polyline: {
    strokeColor: "#4444FF",
    strokeWidth: 4,
    clampToGround: true
  },
  polygon: {
    fillColor: "rgba(255, 0, 0, 0.3)",
    stroke: true,
    strokeColor: "#FF0000",
    strokeWidth: 3
  }
  };


  // ==================================
  // CZML Layer (Central Area)
  // ==================================
  const czmlData = [
  {
    id: "document",
    name: "CZML Styling Example",
    version: "1.0"
  },
  // Point (North)
  {
    id: "marker",
    name: "CZML Point",
    position: {
      cartographicDegrees: [139.700, 35.8309591, 0]
    },
    point: {}
  },
  // Line (Middle)
  {
    id: "polyline",
    name: "CZML Line",
    polyline: {
      positions: {
        cartographicDegrees: [
          139.700, 35.7833277, 0,
          139.700, 35.7507895, 0
        ]
      },
      width: 5,
      clampToGround: true
    }
  },
  // Polygon (South)
  {
    id: "polygon",
    name: "CZML Polygon",
    polygon: {
      positions: {
        cartographicDegrees: [
          139.680, 35.7109591, 0,
          139.700, 35.7300069, 0,
          139.720, 35.6900069, 0,
          139.680, 35.7109591, 0
        ]
      }
    }
  }
  ];

  const czmlString = JSON.stringify(czmlData);
  const encodedCzml = "data:text/plain;charset=UTF-8," + encodeURIComponent(czmlString);

  const czmlLayer = {
  type: "simple",
  data: {
    type: "czml",
    url: encodedCzml
  },
  marker: {
    style: "point",
    pointColor: "#44FF44",
    pointSize: 15,
    pointOutlineColor: "white",
    pointOutlineWidth: 2
  },
  polyline: {
    strokeColor: "#FF44FF",
    strokeWidth: 4
  },
  polygon: {
    fillColor: "rgba(0, 255, 0, 0.3)",
    stroke: true,
    strokeColor: "#00FF00",
    strokeWidth: 3
  }
  };

  // ==================================
  // KML Layer (East Area)
  // ==================================
  const kmlData = \`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>KML Styling Examples</name>

    <!-- Define styles -->
    <Style id="pointStyle">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.5</scale>
      </IconStyle>
    </Style>

    <Style id="lineStyle">
      <LineStyle>
        <color>ffffff44</color>
        <width>4</width>
      </LineStyle>
    </Style>

    <Style id="polygonStyle">
      <PolyStyle>
        <color>4400ffff</color>
      </PolyStyle>
      <LineStyle>
        <color>ff00ffff</color>
        <width>3</width>
      </LineStyle>
    </Style>

    <!-- Point (North) -->
    <Placemark>
      <name></name>
      <styleUrl>#pointStyle</styleUrl>
      <Point>
        <coordinates>139.800,35.8309591,0</coordinates>
      </Point>
    </Placemark>

    <!-- Line (Middle) -->
    <Placemark>
      <name>KML Line</name>
      <styleUrl>#lineStyle</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>
          139.800,35.7833277,0
          139.800,35.7507895,0
        </coordinates>
      </LineString>
    </Placemark>

    <!-- Polygon (South) -->
    <Placemark>
      <name>KML Polygon</name>
      <styleUrl>#polygonStyle</styleUrl>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              139.780,35.7109591,0
              139.800,35.7300069,0
              139.820,35.6900069,0
              139.780,35.7109591,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>\`;

const encodedKml = "data:text/plain;charset=UTF-8," + encodeURIComponent(kmlData);

const kmlLayer = {
  type: "simple",
  data: {
    type: "kml",
    url: encodedKml
  },
  marker: {
    pointColor: "#4444FF",
    pointSize: 15,
    pointOutlineColor: "white",
    pointOutlineWidth: 2
  },
  polyline: {
    strokeColor: "#FFFF44",
    strokeWidth: 4,
    clampToGround: true
  },
  polygon: {
    fillColor: "rgba(0, 0, 255, 0.3)",
    stroke: true,
    strokeColor: "#0000FF",
    strokeWidth: 3
  }
};
// Add all layers
reearth.layers.add(geojsonLayer);
reearth.layers.add(czmlLayer);
reearth.layers.add(kmlLayer);

// Position camera to view all features
reearth.camera.flyTo({
  lng: 139.700,  // Center position to align all features
  lat: 35.7609591,   // Adjusted for better view of all features
  height: 40000,     // Increased height to see all features clearly
  heading: 0,
  pitch: -1.55,
  roll: 0
});`
};

export const layerStylingExamples: PluginType = {
  id: "layer-styling-examples",
  title: "Layer Styling Examples",
  files: [widgetFile, yamlFile]
};

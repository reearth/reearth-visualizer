import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "kml-styling-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: kml-styling-plugin
name: KML Styling Examples
version: 1.0.0
extensions:
  - id: kml-styling
    type: widget
    name: KML Styling
    description: Examples of KML features with different styling options
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "kml-styling",
  title: "kml-styling.js",
  sourceCode: `const kmlData = \`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Styling Examples</name>

    <!-- Define styles -->
    <Style id="pointStyle">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.2</scale>
      </IconStyle>
    </Style>

    <Style id="lineStyle">
      <LineStyle>
        <color>ff00ff00</color>
        <width>3</width>
      </LineStyle>
    </Style>

    <Style id="polygonStyle">
      <PolyStyle>
        <color>7f00ff00</color>
      </PolyStyle>
      <LineStyle>
        <color>ff0000ff</color>
        <width>2</width>
      </LineStyle>
    </Style>

    <!-- Left: Polygon -->
    <Placemark>
      <name>Sample Polygon</name>
      <styleUrl>#polygonStyle</styleUrl>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              139.6673068,35.7809591,0
              139.6907681,35.8100069,0
              139.7188891,35.7500069,0
              139.6673068,35.7809591,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

    <!-- Center: Line -->
    <Placemark>
      <name>Sample Line</name>
      <styleUrl>#lineStyle</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>
          139.7500782,35.8133277,0
          139.7505822,35.7307895,0
        </coordinates>
      </LineString>
    </Placemark>

    <!-- Right: Point -->
    <Placemark>
      <name></name>
      <styleUrl>#pointStyle</styleUrl>
      <Point>
        <coordinates>139.8073068,35.7709591,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>\`;

// Create data URI from KML
const encodedKml = "data:text/plain;charset=UTF-8," + encodeURIComponent(kmlData);

// Define KML layer with styling
const kmlLayer = {
  type: "simple",
  data: {
    type: "kml",
    url: encodedKml
  },
  marker: {
    pointColor: "red",
    pointSize: 12,
    pointOutlineColor: "white",
    pointOutlineWidth: 1
  },
  polyline: {
    strokeColor: "blue",
    strokeWidth: 3,
    clampToGround: true
  },
  polygon: {
    fillColor: "rgba(255, 0, 0, 0.5)",
    stroke: true,
    strokeColor: "blue",
    strokeWidth: 2
  }
};

// Add layer and fly to view
const layerId = reearth.layers.add(kmlLayer);

// Camera positioned to center on all features
reearth.camera.flyTo({
 lng: 139.7373068,  // Centered between all features
 lat: 35.7709591,   // Same latitude as features
  height: 25000,
  heading: 0,
  pitch: -1.55,
  roll: 0,
});`
};

export const kmlStyling: PluginType = {
  id: "kml-styling",
  title: "KML Styling",
  files: [widgetFile, yamlFile]
};

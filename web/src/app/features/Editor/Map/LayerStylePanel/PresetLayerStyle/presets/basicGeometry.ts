import { PresetStyle, PresetStyleCategory } from "./types";

const pointsStyle: PresetStyle = {
  id: "points",
  title: "Points",
  titleJa: "点群",
  testId: "preset-style-points",
  style: {
    marker: {
      height: 0,
      heightReference: "relative",
      pointColor: "#E9373D",
      pointOutlineColor: "white",
      pointOutlineWidth: 1,
      pointSize: 12,
      style: "point"
    }
  }
};

const pointWithLabelStyle: PresetStyle = {
  id: "pointWithLabel",
  title: "Point with label",
  titleJa: "ラベル付き点",
  testId: "preset-style-point-with-label",
  style: {
    marker: {
      height: 0,
      heightReference: "relative",
      label: true,
      labelPosition: "right",
      labelText: "text",
      pointColor: "#E9373D",
      pointOutlineColor: "white",
      pointOutlineWidth: 1,
      pointSize: 12,
      style: "point"
    }
  }
};

const polylineStyle: PresetStyle = {
  id: "polyline",
  title: "Polyline",
  titleJa: "折れ線",
  testId: "preset-style-polyline",
  style: {
    polyline: {
      clampToGround: true,
      hideIndicator: true,
      selectedFeatureColor: "#F1AF02",
      strokeColor: "#E9373D",
      strokeWidth: 2
    }
  }
};

const polygonStyle: PresetStyle = {
  id: "polygon",
  title: "Polygon",
  titleJa: "多角形",
  testId: "preset-style-polygon",
  style: {
    polygon: {
      fillColor: "#E9373D",
      heightReference: "clamp",
      hideIndicator: true,
      selectedFeatureColor: "#F1AF02"
    }
  }
};

const extrudedPolygonStyle: PresetStyle = {
  id: "extrudedPolygon",
  title: "Extruded polygon",
  titleJa: "押し出し多角形",
  testId: "preset-style-extruded-polygon",
  style: {
    polygon: {
      extrudedHeight: {
        expression: "${extrudedHeight}"
      },
      fillColor: "#E9373D",
      heightReference: "clamp",
      hideIndicator: true,
      selectedFeatureColor: "#F1AF02"
    }
  }
};

const threeDTilesStyle: PresetStyle = {
  id: "threeDTiles",
  title: "3D Tiles",
  titleJa: "3Dタイル",
  testId: "preset-style-3d-tiles",
  style: {
    "3dtiles": {
      color: "#FFFFFF",
      colorBlendMode: "highlight",
      pbr: false
    }
  }
};

export const basicGeometryPresets: PresetStyleCategory = {
  id: "basicGeometry",
  title: "Basic Geometry",
  titleJa: "基本ジオメトリ",
  testId: "preset-style-basic-geometry",
  subs: [
    pointsStyle,
    pointWithLabelStyle,
    polylineStyle,
    polygonStyle,
    extrudedPolygonStyle,
    threeDTilesStyle
  ]
};

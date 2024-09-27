export const defaultStyle = {
  marker: {
    heightReference: "clamp"
  },
  polygon: {
    extrudedHeight: {
      expression: "${extrudedHeight}"
    },
    fillColor: {
      expression: "color('#ffffff',0.8)"
    },
    heightReference: "clamp"
  },
  polyline: {
    clampToGround: true,
    strokeColor: "#FFFFFF",
    strokeWidth: 2
  }
};

export const professionalStyle = {
  marker: {
    heightReference: "clamp",
    hideIndicator: "false",
    pointColor: "#E9373D",
    pointOutlineColor: "white",
    pointOutlineWidth: 1,
    pointSize: 12,
    selectedFeatureColor: "#F1AF02",
    style: "point"
  },
  polygon: {
    extrudedHeight: {
      expression: "${extrudedHeight}"
    },
    fillColor: {
      expression: "color('#E9373D',0.6)"
    },
    heightReference: "clamp",
    hideIndicator: "false",
    selectedFeatureColor: {
      expression: "color('#F1AF02',0.6)"
    }
  },
  polyline: {
    clampToGround: true,
    hideIndicator: "false",
    selectedFeatureColor: "#F1AF02",
    strokeColor: "#E9373D",
    strokeWidth: 2
  }
};

export const pointStyle = {
  marker: {
    height: 0,
    heightReference: "relative",
    pointColor: "#E9373D",
    pointOutlineColor: "white",
    pointOutlineWidth: 1,
    pointSize: 12,
    style: "point"
  }
};

export const pointWithLabelStyle = {
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
};

export const polylineStyle = {
  polyline: {
    clampToGround: true,
    hideIndicator: "false",
    selectedFeatureColor: "#F1AF02",
    strokeColor: "#E9373D",
    strokeWidth: 2
  }
};

export const polygonStyle = {
  polygon: {
    fillColor: "#E9373D",
    heightReference: "clamp",
    hideIndicator: "false",
    selectedFeatureColor: "#F1AF02"
  }
};

export const extrudedPolygonStyle = {
  polygon: {
    extrudedHeight: {
      expression: "${extrudedHeight}"
    },
    fillColor: "#E9373D",
    heightReference: "clamp",
    hideIndicator: "false",
    selectedFeatureColor: "#F1AF02"
  }
};

export const threeDTilesStyle = {
  "3dtiles": {
    color: "#FFFFFF",
    colorBlendMode: "highlight",
    pbr: false
  }
};

export const simpleStyle = {
  marker: {
    pointColor: {
      expression: "${marker-color}"
    },
    pointOutlineColor: {
      expression: "${marker-color}"
    },
    pointSize: {
      expression: {
        conditions: [
          ["${marker-size}==='small'", "8"],
          ["${marker-size}==='medium'", "12"],
          ["${marker-size}==='large'", "16"]
        ]
      }
    },
    style: "point"
  },
  polygon: {
    fillColor: {
      expression: "color(${fill},${fill-opacity})"
    },
    heightReference: "clamp",
    stroke: "true",
    strokeColor: {
      expression: "${stroke}"
    },
    strokeWidth: {
      expression: "${stroke-width}"
    }
  },
  polyline: {
    clampToGround: true,
    strokeColor: {
      expression: "color(${stroke},${stroke-opacity})"
    },
    strokeWidth: {
      expression: "${stroke-width}"
    }
  }
};

export const colorBuildingsByHeight = {
  "3dtiles": {
    color: {
      expression: {
        conditions: [
          ["${計測高さ}>=180", "color('#F9FD4C')"],
          ["${計測高さ}>=120", "color('#F6CD3D')"],
          ["${計測高さ}>=60", "color('#EBD384')"],
          ["${計測高さ}>=31", "color('#9E79BA')"],
          ["${計測高さ}>=12", "color('#5230C2')"],
          ["true", "color('#362C52')"]
        ]
      }
    },
    colorBlendMode: "highlight",
    pbr: false,
    shadows: "disabled"
  }
};

export const sketchLayerStyle = {
  marker: {
    height: 0,
    heightReference: "clamp",
    hideIndicator: true,
    selectedFeatureColor: "#00bebe"
  },
  polygon: {
    classificationType: "terrain",
    extrudedHeight: {
      expression: "${extrudedHeight}"
    },
    fillColor: "#FFFFFF",
    height: 0,
    heightReference: "clamp",
    hideIndicator: true,
    selectedFeatureColor: "#00bebe",
    shadows: "enabled"
  },
  polyline: {
    clampToGround: true,
    height: 0,
    hideIndicator: true,
    selectedFeatureColor: "#00bebe",
    shadows: "enabled",
    strokeColor: "#FFFFFF",
    strokeWidth: 2
  }
};

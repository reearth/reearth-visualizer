import { LayerAppearanceTypes } from "@reearth/core";
import type { LayerStyle } from "@reearth/services/api/layerStyle";

export const defaultStyle: Partial<LayerAppearanceTypes> = {
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
  },
  "3dtiles": {
    color: "#FFFFFF",
    colorBlendMode: "highlight"
  }
};

export const professionalStyle = {
  marker: {
    heightReference: "clamp",
    hideIndicator: true,
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
    hideIndicator: true,
    selectedFeatureColor: {
      expression: "color('#F1AF02',0.6)"
    }
  },
  polyline: {
    clampToGround: true,
    hideIndicator: true,
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
    hideIndicator: true,
    selectedFeatureColor: "#F1AF02",
    strokeColor: "#E9373D",
    strokeWidth: 2
  }
};

export const polygonStyle = {
  polygon: {
    fillColor: "#E9373D",
    heightReference: "clamp",
    hideIndicator: true,
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
    hideIndicator: true,
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
          ["${bldg:measuredHeight}>=180", "color('#F9FD4C')"],
          ["${bldg:measuredHeight}>=120", "color('#F6CD3D')"],
          ["${bldg:measuredHeight}>=60", "color('#EBD384')"],
          ["${bldg:measuredHeight}>=31", "color('#9E79BA')"],
          ["${bldg:measuredHeight}>=12", "color('#5230C2')"],
          ["true", "color('#362C52')"]
        ]
      }
    },
    colorBlendMode: "highlight",
    pbr: false,
    shadows: "disabled"
  }
};

export const getLayerStyleName = (
  baseName: string,
  layerStyles?: LayerStyle[]
) => {
  if (!layerStyles) return `${baseName}.01`;
  const nextNumber =
    layerStyles.reduce((max, style) => {
      const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = style.name?.match(
        new RegExp(`^${escapedBaseName}\\.(\\d+)$`)
      );
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0) + 1;

  return `${baseName}.${nextNumber.toString().padStart(2, "0")}`;
};

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

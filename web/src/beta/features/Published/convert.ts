import { mapValues } from "lodash-es";

export const processProperty = (p: any): any => {
  if (typeof p !== "object") return p;
  return mapValues(p, g =>
    Array.isArray(g) ? g.map(h => processPropertyGroup(h)) : processPropertyGroup(g),
  );
};

const processPropertyGroup = (g: any): any => {
  if (typeof g !== "object") return g;
  return mapValues(g, v => {
    // For compability
    if (Array.isArray(v)) {
      return v.map(vv =>
        typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v
          ? { ...vv, height: vv.altitude }
          : vv,
      );
    }
    if (typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v) {
      return {
        ...v,
        height: v.altitude,
      };
    }
    return v;
  });
};

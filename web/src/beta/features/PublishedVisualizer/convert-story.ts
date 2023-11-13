import { mapValues } from "lodash-es";

export const processStoryProperty = (p: any): any => {
  if (typeof p !== "object") return p;
  return mapValues(p, g => {
    return Array.isArray(g)
      ? g.map(h => ({
          ...processPropertyGroup(h),
          id: h.id,
        }))
      : processPropertyGroup(g);
  });
};

function processPropertyGroup(g: any): any {
  if (typeof g !== "object") return g;
  return mapValues(g, v => {
    if (Array.isArray(v)) {
      return {
        value: v.map(vv =>
          typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v // For compability
            ? { value: { ...vv, height: vv.altitude } }
            : vv,
        ),
      };
    }
    if (typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v) {
      return {
        value: {
          ...v,
          height: v.altitude,
        },
      };
    }
    return { value: v };
  });
}

import { mapValues } from "lodash-es";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const processProperty = (p: any): any => {
  // Property processing requires dynamic typing
  if (typeof p !== "object") return p;
  return mapValues(p, (g) =>
    Array.isArray(g)
      ? g.map((h) => processPropertyGroup(h))
      : processPropertyGroup(g)
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processPropertyGroup = (g: any): any => {
  // Property groups have dynamic structure
  if (typeof g !== "object") return g;
  return mapValues(g, (v) => {
    // For compability
    if (Array.isArray(v)) {
      return v.map((vv) =>
        typeof v === "object" &&
        v &&
        "lat" in v &&
        "lng" in v &&
        "altitude" in v
          ? { ...vv, height: vv.altitude }
          : vv
      );
    }
    if (
      typeof v === "object" &&
      v &&
      "lat" in v &&
      "lng" in v &&
      "altitude" in v
    ) {
      return {
        ...v,
        height: v.altitude
      };
    }
    return v;
  });
};

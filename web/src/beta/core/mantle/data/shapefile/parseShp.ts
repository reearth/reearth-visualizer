import type {
  GeometryObject,
  Feature as GeoJSONFeature,
  MultiPoint,
  Polygon,
  MultiLineString,
} from "geojson";
import proj4 from "proj4";

import { generateRandomString } from "../utils";

export function parseShp(
  buffer: ArrayBuffer,
  trans?: proj4.Converter | false,
): GeoJSONFeature<GeometryObject>[] {
  const headers = parseHeader(buffer);
  const parseFunc = getParseFunction(headers.shpCode, trans);
  const rows = getRows(buffer, headers, parseFunc);
  return rows;
}

function parseHeader(buffer: ArrayBuffer): {
  length: number;
  version: number;
  shpCode: number;
  bbox: number[];
} {
  const view = new DataView(buffer, 0, 100);
  return {
    length: view.getInt32(6 << 2, false) << 1,
    version: view.getInt32(7 << 2, true),
    shpCode: view.getInt32(8 << 2, true),
    bbox: [
      view.getFloat64(9 << 2, true),
      view.getFloat64(11 << 2, true),
      view.getFloat64(13 << 2, true),
      view.getFloat64(15 << 2, true),
    ],
  };
}

function makeParseCoord(
  trans?: proj4.Converter | false,
): (data: DataView, offset: number) => number[] {
  if (trans) {
    return (data: DataView, offset: number) => {
      const x = data.getFloat64(offset, true);
      const y = data.getFloat64(offset + 8, true);
      return trans.inverse([x, y]);
    };
  } else {
    return (data: DataView, offset: number) => [
      data.getFloat64(offset, true),
      data.getFloat64(offset + 8, true),
    ];
  }
}

function getParseFunction(
  shpCode: number,
  trans?: proj4.Converter | false,
): (data: ArrayBuffer) => GeoJSONFeature<GeometryObject> | null {
  const num = shpCode > 20 ? shpCode - 20 : shpCode;
  const shpFuncObj: { [key: number]: keyof typeof parseFunctions } = {
    1: "parsePoint",
    3: "parsePolyline",
    5: "parsePolygon",
    8: "parseMultiPoint",
    11: "parseZPoint",
    13: "parseZPolyline",
    15: "parseZPolygon",
  };
  const funcName = shpFuncObj[num];
  if (!funcName) {
    throw new Error("Unsupported shape type");
  }
  const parseCoord = makeParseCoord(trans);

  switch (funcName) {
    case "parsePoint":
    case "parseZPoint":
    case "parseMultiPoint":
    case "parsePolyline":
    case "parseZPolyline":
    case "parsePolygon":
    case "parseZPolygon":
      return (data: ArrayBuffer) => parseFunctions[funcName](new DataView(data), parseCoord);
    case "parsePointArray":
      return (data: ArrayBuffer) =>
        parseFunctions[funcName](
          new DataView(data),
          0,
          new DataView(data).getInt32(32, true),
          parseCoord,
        );
    case "parseArrayGroup":
      return (data: ArrayBuffer) =>
        parseFunctions[funcName](
          new DataView(data),
          44,
          40,
          new DataView(data).getInt32(32, true),
          new DataView(data).getInt32(36, true),
          parseCoord,
        );
    default:
      throw new Error("Unsupported shape type");
  }
}

function getRows(
  buffer: ArrayBuffer,
  headers: ReturnType<typeof parseHeader>,
  parseFunc: ReturnType<typeof getParseFunction>,
): GeoJSONFeature<GeometryObject>[] {
  const rows: GeoJSONFeature<GeometryObject>[] = [];
  let offset = 100;
  const bufferLength = buffer.byteLength;
  while (offset + 8 <= bufferLength) {
    const record = getRow(buffer, offset, bufferLength);
    if (!record) {
      break;
    }
    offset += 8 + record.len;
    const feature = parseFunc(record.data);
    if (feature) {
      feature.id = generateRandomString(12);
      rows.push(feature);
    }
  }
  return rows;
}

function getRow(
  buffer: ArrayBuffer,
  offset: number,
  bufferLength: number,
):
  | {
      id: number;
      len: number;
      data: ArrayBuffer;
      type: number;
    }
  | undefined {
  const view = new DataView(buffer, offset, 12);
  const len = view.getInt32(4, false) << 1;
  const id = view.getInt32(0, false);
  if (len === 0) {
    return {
      id,
      len,
      data: new ArrayBuffer(0),
      type: 0,
    };
  }
  if (offset + len + 8 > bufferLength) {
    return undefined;
  }
  return {
    id,
    len,
    data: buffer.slice(offset + 12, offset + len + 8),
    type: view.getInt32(8, true),
  };
}

const parseFunctions = {
  parsePoint(
    data: DataView,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: parseCoord(data, 0),
      },
      properties: {},
    };
  },

  parseZPoint(
    data: DataView,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const pointXY = parseFunctions.parsePoint(data, parseCoord);
    (pointXY.geometry as any).coordinates.push(data.getFloat64(16, true));
    return pointXY;
  },

  parsePointArray(
    data: DataView,
    offset: number,
    num: number,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const coordinates: number[][] = [];
    for (let i = 0; i < num; i++) {
      coordinates.push(parseCoord(data, offset));
      offset += 16;
    }
    return {
      type: "Feature",
      geometry: {
        type: "MultiPoint",
        coordinates,
      },
      properties: {},
    };
  },

  parseZPointArray(
    data: DataView,
    zOffset: number,
    num: number,
    coordinates: number[][],
  ): number[][] {
    for (let i = 0; i < num; i++) {
      coordinates[i].push(data.getFloat64(zOffset, true));
      zOffset += 8;
    }
    return coordinates;
  },

  parseArrayGroup(
    data: DataView,
    offset: number,
    partOffset: number,
    num: number,
    tot: number,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<Polygon> {
    const coordinates: number[][][] = [];
    let pointOffset = offset;
    for (let i = 0; i < num; i++) {
      const pointNum =
        i === num - 1
          ? tot - data.getInt32(partOffset, true)
          : data.getInt32(partOffset + 4, true) - data.getInt32(partOffset, true);
      partOffset += 4;
      if (pointNum === 0) {
        continue;
      }
      const feature = parseFunctions.parsePointArray(data, pointOffset, pointNum, parseCoord);
      coordinates.push((feature.geometry as MultiPoint).coordinates);
      pointOffset += pointNum << 4;
    }
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates,
      },
      properties: {},
    };
  },

  parseZArrayGroup(
    data: DataView,
    zOffset: number,
    num: number,
    coordinates: number[][][],
  ): number[][][] {
    for (let i = 0; i < num; i++) {
      coordinates[i] = parseFunctions.parseZPointArray(
        data,
        zOffset,
        coordinates[i].length,
        coordinates[i],
      );
      zOffset += coordinates[i].length << 3;
    }
    return coordinates;
  },

  parseMultiPoint(
    data: DataView,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<MultiPoint> {
    const num = data.getInt32(32, true);
    if (num === 0) {
      return {
        type: "Feature",
        geometry: {
          type: "MultiPoint",
          coordinates: [],
        },
        properties: {},
      };
    }
    const bounds = [parseCoord(data, 0), parseCoord(data, 16)];
    const pointOffset = 36;
    const feature = parseFunctions.parsePointArray(data, pointOffset, num, parseCoord);
    const coordinates = (feature.geometry as MultiPoint).coordinates;
    return {
      type: "Feature",
      geometry: {
        type: "MultiPoint",
        coordinates,
      },
      properties: {},
      bbox: [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]],
    };
  },

  parsePolyline(
    data: DataView,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<MultiLineString> {
    const numParts = data.getInt32(32, true);
    if (numParts === 0) {
      return {
        type: "Feature",
        geometry: {
          type: "MultiLineString",
          coordinates: [],
        },
        properties: {},
      };
    }
    const bounds = [parseCoord(data, 0), parseCoord(data, 16)];
    const num = data.getInt32(36, true);
    const partOffset = 40;
    const pointOffset = 40 + (numParts << 2);
    const feature = parseFunctions.parseArrayGroup(
      data,
      pointOffset,
      partOffset,
      numParts,
      num,
      parseCoord,
    );
    const coordinates = (feature.geometry as Polygon).coordinates;
    return {
      type: "Feature",
      geometry: {
        type: "MultiLineString",
        coordinates,
      },
      properties: {},
      bbox: [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]],
    };
  },

  parseZPolyline(
    data: DataView,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const feature = parseFunctions.parsePolyline(data, parseCoord);
    const numParts = data.getInt32(32, true);
    const num = data.getInt32(36, true);
    const zOffset = 56 + (num << 4) + (numParts << 2);
    (feature.geometry as any).coordinates = parseFunctions.parseZArrayGroup(
      data,
      zOffset,
      numParts,
      (feature.geometry as any).coordinates,
    );
    return feature;
  },

  parsePolygon(
    data: DataView,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const feature = parseFunctions.parsePolyline(data, parseCoord);
    (feature.geometry as any).type = "MultiPolygon";
    (feature.geometry as any).coordinates = handleRings((feature.geometry as any).coordinates);
    return feature;
  },

  parseZPolygon(
    data: DataView,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const feature = parseFunctions.parseZPolyline(data, parseCoord);
    (feature.geometry as any).type = "MultiPolygon";
    (feature.geometry as any).coordinates = handleRings((feature.geometry as any).coordinates);
    return feature;
  },
};

function handleRings(rings: number[][][]): number[][][][] {
  const clockwiseRings: {
    ring: number[][];
    bbox: number[];
    children: number[][][];
  }[] = [];
  const counterClockwiseRings: {
    ring: number[][];
    bbox: number[];
    children: number[][][];
  }[] = [];

  for (const ring of rings) {
    const { ring: coordinates, bbox, clockwise } = isClockwise(ring);
    if (clockwise) {
      clockwiseRings.push({ ring: coordinates, bbox, children: [] });
    } else {
      counterClockwiseRings.push({ ring: coordinates, bbox, children: [] });
    }
  }

  for (const counterClockwiseRing of counterClockwiseRings) {
    let parent: (typeof clockwiseRings)[number] | undefined;
    for (const clockwiseRing of clockwiseRings) {
      if (contains(clockwiseRing.bbox, counterClockwiseRing.bbox)) {
        parent = clockwiseRing;
        break;
      }
    }
    if (parent) {
      parent.children.push(counterClockwiseRing.ring);
    }
  }

  return clockwiseRings.map(({ ring, children }) => [ring, ...children]);
}

function isClockwise(ring: number[][]): { ring: number[][]; bbox: number[]; clockwise: boolean } {
  const [firstPoint, ...otherPoints] = ring;
  let minX = firstPoint[0];
  let minY = firstPoint[1];
  let maxX = firstPoint[0];
  let maxY = firstPoint[1];

  let signedArea = 0;
  let previousPoint = firstPoint;

  for (const point of otherPoints) {
    const [x, y] = point;
    signedArea += (point[0] - previousPoint[0]) * (point[1] + previousPoint[1]);
    previousPoint = point;

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return {
    ring,
    bbox: [minX, minY, maxX, maxY],
    clockwise: signedArea >= 0,
  };
}

function contains(outerBbox: number[], innerBbox: number[]): boolean {
  const [outerMinX, outerMinY, outerMaxX, outerMaxY] = outerBbox;
  const [innerMinX, innerMinY, innerMaxX, innerMaxY] = innerBbox;

  return (
    outerMinX <= innerMinX &&
    outerMinY <= innerMinY &&
    outerMaxX >= innerMaxX &&
    outerMaxY >= innerMaxY
  );
}

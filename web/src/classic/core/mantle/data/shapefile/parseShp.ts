import type { GeometryObject, Feature as GeoJSONFeature, MultiPoint, Polygon } from "geojson";
import proj4 from "proj4";

export function parseShp(
  buffer: Buffer,
  trans?: proj4.Converter,
): GeoJSONFeature<GeometryObject>[] {
  const headers = parseHeader(buffer);
  const parseFunc = getParseFunction(headers.shpCode, trans);
  const rows = getRows(buffer, headers, parseFunc);
  return rows;
}

function parseHeader(buffer: Buffer): {
  length: number;
  version: number;
  shpCode: number;
  bbox: number[];
} {
  const view = buffer.subarray(0, 100);
  return {
    length: view.readInt32BE(6 << 2) << 1,
    version: view.readInt32LE(7 << 2),
    shpCode: view.readInt32LE(8 << 2),
    bbox: [
      view.readDoubleLE(9 << 2),
      view.readDoubleLE(11 << 2),
      view.readDoubleLE(13 << 2),
      view.readDoubleLE(15 << 2),
    ],
  };
}

function makeParseCoord(trans?: proj4.Converter): (data: Buffer, offset: number) => number[] {
  if (trans) {
    return (data: Buffer, offset: number) => {
      const x = data.readDoubleLE(offset);
      const y = data.readDoubleLE(offset + 8);
      return trans.inverse([x, y]);
    };
  } else {
    return (data: Buffer, offset: number) => [
      data.readDoubleLE(offset),
      data.readDoubleLE(offset + 8),
    ];
  }
}

function getParseFunction(
  shpCode: number,
  trans?: proj4.Converter,
): (data: Buffer) => GeoJSONFeature<GeometryObject> | null {
  const num = shpCode > 20 ? shpCode - 20 : shpCode;
  const shpFuncObj: { [key: number]: keyof typeof parseFunctions } = {
    1: "parsePoint",
    3: "parsePolyline",
    5: "parsePolygon",
    8: "parseMultiPoint",
    11: "parseZPoint",
    13: "parseZPolyline",
    15: "parseZPolygon",
    18: "parseZMultiPoint",
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
    case "parseZMultiPoint":
    case "parsePolyline":
    case "parseZPolyline":
    case "parsePolygon":
    case "parseZPolygon":
      return (data: Buffer) => parseFunctions[funcName](data, parseCoord);
    case "parsePointArray":
      return (data: Buffer) => parseFunctions[funcName](data, 0, data.readInt32LE(32), parseCoord);
    case "parseArrayGroup":
      return (data: Buffer) =>
        parseFunctions[funcName](
          data,
          44,
          40,
          data.readInt32LE(32),
          data.readInt32LE(36),
          parseCoord,
        );
    default:
      throw new Error("Unsupported shape type");
  }
}

function getRows(
  buffer: Buffer,
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
      rows.push(feature);
    }
  }
  return rows;
}

function getRow(
  buffer: Buffer,
  offset: number,
  bufferLength: number,
):
  | {
      id: number;
      len: number;
      data: Buffer;
      type: number;
    }
  | undefined {
  const view = buffer.subarray(offset, offset + 12);
  const len = view.readInt32BE(4) << 1;
  const id = view.readInt32BE(0);
  if (len === 0) {
    return {
      id,
      len,
      data: Buffer.alloc(0),
      type: 0,
    };
  }
  if (offset + len + 8 > bufferLength) {
    return undefined;
  }
  return {
    id,
    len,
    data: buffer.subarray(offset + 12, offset + len + 8),
    type: view.readInt32LE(8),
  };
}

const parseFunctions = {
  parsePoint(
    data: Buffer,
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
    data: Buffer,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const pointXY = parseFunctions.parsePoint(data, parseCoord);
    (pointXY.geometry as any).coordinates.push(data.readDoubleLE(16));
    return pointXY;
  },

  parsePointArray(
    data: Buffer,
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
    data: Buffer,
    zOffset: number,
    num: number,
    coordinates: number[][],
  ): number[][] {
    for (let i = 0; i < num; i++) {
      coordinates[i].push(data.readDoubleLE(zOffset));
      zOffset += 8;
    }
    return coordinates;
  },

  parseArrayGroup(
    data: Buffer,
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
          ? tot - data.readInt32LE(partOffset)
          : data.readInt32LE(partOffset + 4) - data.readInt32LE(partOffset);
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
    data: Buffer,
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
    data: Buffer,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const num = data.readInt32LE(32);
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
    const coordinates = parseFunctions.parsePointArray(data, pointOffset, num, parseCoord);
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

  parseZMultiPoint(
    data: Buffer,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const feature = parseFunctions.parseMultiPoint(data, parseCoord);
    const num = (feature.geometry as any).coordinates.length;
    const zOffset = 52 + (num << 4);
    (feature.geometry as any).coordinates = parseFunctions.parseZPointArray(
      data,
      zOffset,
      num,
      (feature.geometry as any).coordinates,
    );
    return feature;
  },

  parsePolyline(
    data: Buffer,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const numParts = data.readInt32LE(32);
    if (numParts === 0) {
      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [],
        },
        properties: {},
      };
    }
    const bounds = [parseCoord(data, 0), parseCoord(data, 16)];
    const num = data.readInt32LE(36);
    const partOffset = 40;
    const pointOffset = 40 + (numParts << 2);
    const parts = parseFunctions.parseArrayGroup(
      data,
      pointOffset,
      partOffset,
      numParts,
      num,
      parseCoord,
    );
    return {
      type: "Feature",
      geometry: {
        type: "MultiLineString",
        coordinates: parts,
      },
      properties: {},
      bbox: [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]],
    };
  },

  parseZPolyline(
    data: Buffer,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const feature = parseFunctions.parsePolyline(data, parseCoord);
    const numParts = data.readInt32LE(32);
    const num = data.readInt32LE(36);
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
    data: Buffer,
    parseCoord: ReturnType<typeof makeParseCoord>,
  ): GeoJSONFeature<GeometryObject> {
    const feature = parseFunctions.parsePolyline(data, parseCoord);
    (feature.geometry as any).type = "MultiPolygon";
    (feature.geometry as any).coordinates = handleRings((feature.geometry as any).coordinates);
    return feature;
  },

  parseZPolygon(
    data: Buffer,
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

function isClockwise(ring: number[][]): {
  ring: number[][];
  bbox: number[];
  clockwise: boolean;
} {
  const [firstPoint, ...otherPoints] = ring;
  const [minX, minY] = firstPoint;
  const [maxX, maxY] = firstPoint;

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

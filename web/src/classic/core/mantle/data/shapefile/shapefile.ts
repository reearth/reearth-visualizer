import { Buffer } from "buffer";

import type { GeoJSON, GeometryObject, Feature as GeoJSONFeature } from "geojson";
import JSZip from "jszip";
import proj4 from "proj4";

import type { Data, DataRange, Feature } from "../../types";
import { processGeoJSON } from "../geojson";
import { f, FetchOptions } from "../utils";

import { parseDbf } from "./parseDbf";

async function binaryAjax(url: string, type?: string): Promise<Buffer | string | false> {
  const fullUrl = type ? `${url}.${type}` : url;
  const isOptionalTxt = type === "prj" || type === "cpg";

  try {
    const resp = await fetch(fullUrl);
    if (resp.status > 399) {
      throw new Error(resp.statusText);
    }
    if (isOptionalTxt) {
      return resp.text();
    }
    const parsed = await resp.arrayBuffer();
    return Buffer.from(parsed);
  } catch (e) {
    console.log("ERROR", e, type);
    if (isOptionalTxt || type === "dbf") {
      return false;
    }
    throw e;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function unzip(buffer: Buffer): Promise<{ [key: string]: Buffer | string }> {
  const zip = new JSZip();
  await zip.loadAsync(buffer);
  const files = zip.file(/.+/);
  const out: { [key: string]: Buffer | string } = {};

  await Promise.all(
    files.map(async a => {
      let result;
      if (a.name.slice(-3).toLowerCase() === "shp" || a.name.slice(-3).toLowerCase() === "dbf") {
        result = await a.async("nodebuffer");
      } else {
        result = await a.async("text");
      }
      out[a.name] = result;
    }),
  );

  return out;
}

// function isClockWise(array: number[][]): {
//   ring: number[][];
//   clockWise: boolean;
//   bbox: number[];
//   children: number[][][];
// } {
//   // Implementation of isClockWise function
//   // ...
// }

// function contains(outer: { bbox: number[] }, inner: { bbox: number[] }): boolean {
//   // Implementation of contains function
//   // ...
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleRings(rings: number[][][]) {
  // Implementation of handleRings function
  // ...
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function parseZip(buffer: Buffer | ArrayBuffer, whiteList?: string[]) {
  // Implementation of parseZip function
  // ...
}

function parseShp(buffer: Buffer, trans?: proj4.Converter): GeoJSONFeature<GeometryObject>[] {
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
  return (data: Buffer) => parseFunctions[funcName](data, parseCoord);
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
  ): number[][] {
    const points: number[][] = [];
    for (let i = 0; i < num; i++) {
      points.push(parseCoord(data, offset));
      offset += 16;
    }
    return points;
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
  ): number[][][] {
    const groups: number[][][] = [];
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
      groups.push(parseFunctions.parsePointArray(data, pointOffset, pointNum, parseCoord));
      pointOffset += pointNum << 4;
    }
    return groups;
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

async function combine(
  shp: GeoJSONFeature<GeometryObject>[],
  dbf?: any[],
): Promise<GeoJSON.FeatureCollection> {
  const out: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };
  let i = 0;
  const len = shp.length;
  if (!dbf) {
    dbf = [];
  }
  while (i < len) {
    out.features.push({
      type: "Feature",
      geometry: shp[i].geometry,
      properties: dbf[i] || {},
    });
    i++;
  }
  return out;
}

async function getShapefile(
  base: string | Buffer | ArrayBuffer,
  whiteList?: string[],
): Promise<GeoJSON.GeoJSON> {
  if (typeof base !== "string") {
    return parseZip(base);
  }
  if (base.slice(-4).toLowerCase() === ".zip") {
    const a = await binaryAjax(base);
    return parseZip(a, whiteList);
  }
  const [shpBuffer, prjString] = await Promise.all([
    binaryAjax(base, "shp"),
    binaryAjax(base, "prj"),
  ]);
  let prj = false;
  try {
    if (prjString) {
      prj = proj4(prjString);
    }
  } catch (e) {
    prj = false;
  }
  const shp = parseShp(shpBuffer as Buffer, prj);
  const dbfBuffer = await binaryAjax(base, "dbf");
  const cpgString = await binaryAjax(base, "cpg");
  const dbf = dbfBuffer ? parseDbf(dbfBuffer as Buffer, cpgString as string) : undefined;
  return combine(shp, dbf);
}

export default async function convertShapefileToGeoJSON(
  base: string | Buffer | ArrayBuffer,
  whiteList?: string[],
): Promise<GeoJSON.GeoJSON> {
  return getShapefile(base, whiteList);
}

export async function fetchShapefile(
  data: Data,
  range?: DataRange,
  options?: FetchOptions,
): Promise<Feature[] | void> {
  const arrayBuffer = data.url ? await (await f(data.url, options)).arrayBuffer() : data.value;
  const zip = await JSZip.loadAsync(new Uint8Array(arrayBuffer));

  let shpFileArrayBuffer: ArrayBuffer | undefined;
  let dbfFileArrayBuffer: ArrayBuffer | undefined;

  // Access the files inside the ZIP archive
  const zipEntries = Object.values(zip.files);
  for (const entry of zipEntries) {
    const filename = entry.name;
    if (filename.endsWith(".shp")) {
      shpFileArrayBuffer = await entry.async("arraybuffer");
    } else if (filename.endsWith(".dbf")) {
      dbfFileArrayBuffer = await entry.async("arraybuffer");
    }
  }

  if (shpFileArrayBuffer && dbfFileArrayBuffer) {
    return processGeoJSON(await parseShapefiles(shpFileArrayBuffer, dbfFileArrayBuffer), range);
  } else {
    throw new Error(`Zip archive does not contain .shp and .dbf files`);
  }
}

export const parseShapefiles = async (
  shpFile: ArrayBuffer,
  dbfFile: ArrayBuffer,
  configuration?: Configuration,
): Promise<GeoJSON> => {
  return new ShapefileParser(shpFile, dbfFile, configuration).parse();
};

interface Configuration {
  trim?: boolean;
}

class ShapefileParser {
  #shp: ArrayBuffer;
  #dbf: ArrayBuffer;
  #configuration?: Configuration;
  #features: any[] = [];
  #propertiesArray: any[] = [];

  constructor(shp: ArrayBuffer, dbf: ArrayBuffer, configuration?: Configuration) {
    this.#shp = shp;
    this.#dbf = dbf;
    this.#configuration = configuration;
  }

  #parseShp() {
    const dataView = new DataView(this.#shp);
    let idx = 0;
    const wordLength = dataView.getInt32((idx += 6 * 4), false);
    const byteLength = wordLength * 2;
    idx += 4; //version
    idx += 4; //shapeType
    idx += 4; //minX, minY
    idx += 8 * 8; //min(Y, Z, M),max(X, Y, Z, M)

    const features: any[] = [];
    while (idx < byteLength) {
      const feature: any = {};
      const length: number = dataView.getInt32((idx += 4), false);

      const type: number = dataView.getInt32((idx += 4), true);
      let idxFeature: number = idx + 4;
      let numberOfParts: number, nbpoints: number, numberOfPoints: number, nbpartsPoint: number[];
      switch (type) {
        case 1:
        case 11:
        case 21:
          feature.type = "Point";
          feature.coordinates = [
            dataView.getFloat64(idxFeature, true),
            dataView.getFloat64(idxFeature + 8, true),
          ];
          break;
        case 3:
        case 13:
        case 23:
        case 5:
        case 15:
        case 25:
          if (type === 3 || type === 13 || type === 23) {
            feature.type = "MultiLineString";
          } else if (type === 5 || type === 15 || type === 25) {
            feature.type = "Polygon";
          }
          numberOfParts = dataView.getInt32(idxFeature + 32, true);
          nbpoints = dataView.getInt32(idxFeature + 36, true);
          idxFeature += 40;
          nbpartsPoint = new Array(numberOfParts).fill(0).map(() => {
            const result = dataView.getInt32(idxFeature, true);
            idxFeature += 4;
            return result;
          });

          feature.coordinates = new Array(numberOfParts).fill(0).map((_, i) => {
            const idstart = nbpartsPoint[i];
            const idend = (i < numberOfParts - 1 ? nbpartsPoint[i + 1] : nbpoints) - 1;
            const part = [];
            for (let j = idstart; j <= idend; j++) {
              part.push([
                dataView.getFloat64(idxFeature, true),
                dataView.getFloat64(idxFeature + 8, true),
              ]);
              idxFeature += 16;
            }
            return part;
          });
          break;
        case 8:
        case 18:
        case 28:
          feature.type = "MultiPoint";
          numberOfPoints = dataView.getInt32(idxFeature + 32, true);
          idxFeature += 36;
          feature.coordinates = new Array(numberOfPoints).fill(0).map(() => {
            const result = [
              dataView.getFloat64(idxFeature, true),
              dataView.getFloat64(idxFeature + 8, true),
            ];
            idxFeature += 16;
            return result;
          });
          break;
      }

      idx += length * 2;
      features.push(feature);
    }
    this.#features = features;
  }

  #parseDbf() {
    const dataView = new DataView(new Uint8Array(this.#dbf).buffer);
    let idx = 4;
    const numberOfRecords: number = dataView.getInt32(idx, true);
    idx += 28;
    let end = false;
    const fields = [];
    while (!end) {
      const field: any = {};
      const nameArray: string[] = [];
      for (let i = 0; i < 10; i++) {
        const letter = dataView.getUint8(idx);
        if (letter !== 0) {
          nameArray.push(String.fromCharCode(letter));
        }
        idx += 1;
      }
      field.name = nameArray.join("");
      idx += 1;
      field.type = String.fromCharCode(dataView.getUint8(idx));
      idx += 5;
      field.fieldLength = dataView.getUint8(idx);
      idx += 16;
      fields.push(field);
      if (dataView.getUint8(idx) === 0x0d) {
        break;
      }
    }
    idx += 1;
    const propertiesArray = [];
    for (let i = 0; i < numberOfRecords; i++) {
      const properties: any = {};
      if (!end) {
        try {
          idx += 1;
          for (let j = 0; j < fields.length; j++) {
            let str = "";
            const charString = [];
            for (let h = 0; h < fields[j].fieldLength; h++) {
              charString.push(String.fromCharCode(dataView.getUint8(idx)));
              idx += 1;
            }
            str = charString.join("");
            // }
            if (this.#configuration?.trim !== false) {
              str = str.trim();
            }
            const number = parseFloat(str);
            if (isNaN(number)) {
              properties[fields[j].name] = str;
            } else {
              properties[fields[j].name] = number;
            }
          }
        } catch (err) {
          end = true;
        }
      }
      propertiesArray.push(properties);
    }
    this.#propertiesArray = propertiesArray;
  }

  #geoJSON() {
    const geojson: any = {
      type: "FeatureCollection",
      features: [],
    };
    for (let i = 0; i < Math.min(this.#features.length, this.#propertiesArray.length); i++) {
      geojson.features.push({
        type: "Feature",
        geometry: this.#features[i],
        properties: this.#propertiesArray[i],
      });
    }
    return geojson;
  }

  parse(): GeoJSON {
    this.#parseShp();
    this.#parseDbf();

    return this.#geoJSON();
  }
}

import type { GeoJSON } from "geojson";
import JSZip from "jszip";

import type { Data, DataRange, Feature } from "../types";

import { processGeoJSON } from "./geojson";
import { f, FetchOptions } from "./utils";

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

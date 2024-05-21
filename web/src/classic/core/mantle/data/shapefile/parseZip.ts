import JSZip from "jszip";
import proj4 from "proj4";

import { parseDbf } from "./parseDbf";
import { parseShp } from "./parseShp";
import { combine } from "./shapefile";

function toBuffer(b: ArrayBuffer | Buffer): Buffer {
  if (!b) {
    throw new Error("forgot to pass buffer");
  }
  if (Buffer.isBuffer(b)) {
    return b;
  }
  if (b instanceof ArrayBuffer) {
    return Buffer.from(b);
  }
  throw new Error("Unknown buffer type");
}

export async function parseZip(
  buffer: ArrayBuffer | Buffer,
  whiteList?: string[],
): Promise<GeoJSON.GeoJSON | GeoJSON.GeoJSON[]> {
  buffer = toBuffer(buffer);
  const zip = await JSZip.loadAsync(buffer);
  const names: string[] = [];
  const projections: { [key: string]: proj4.Converter } = {};
  whiteList = whiteList || [];

  for (const key of Object.keys(zip.files)) {
    if (key.indexOf("__MACOSX") !== -1) {
      continue;
    }

    const fileExt = key.slice(-4).toLowerCase();
    const fileName = key.slice(0, -4);

    if (fileExt === ".shp") {
      names.push(fileName);
      zip.files[fileName + ".shp"] = zip.files[key];
    } else if (fileExt === ".prj") {
      projections[fileName] = proj4(await zip.files[key].async("text"));
    } else if (
      fileExt === ".json" ||
      (whiteList && whiteList.indexOf(key.split(".").pop() || "") > -1)
    ) {
      names.push(fileName);
    } else if (fileExt === ".dbf" || fileExt === ".cpg") {
      zip.files[fileName + fileExt] = zip.files[key];
    }
  }

  if (!names.length) {
    throw new Error("no layers found");
  }

  const geojson = await Promise.all(
    names.map(async name => {
      const lastDotIdx = name.lastIndexOf(".");
      if (lastDotIdx > -1 && name.slice(lastDotIdx).indexOf("json") > -1) {
        const parsed = JSON.parse(await zip.files[name].async("text"));
        parsed.fileName = name.slice(0, lastDotIdx);
        return parsed;
      } else if (whiteList && whiteList.indexOf(name.slice(lastDotIdx + 1)) > -1) {
        const parsed = zip.files[name];
        parsed.name = name;
        return parsed;
      } else {
        const shpBuffer = await zip.files[name + ".shp"].async("arraybuffer");
        const dbfBuffer = zip.files[name + ".dbf"]
          ? await zip.files[name + ".dbf"].async("arraybuffer")
          : undefined;
        const cpgString = zip.files[name + ".cpg"]
          ? await zip.files[name + ".cpg"].async("text")
          : undefined;
        const prj = projections[name];

        const shp = parseShp(toBuffer(shpBuffer), prj);
        const dbf = dbfBuffer ? parseDbf(toBuffer(dbfBuffer), cpgString) : undefined;

        const parsed = combine(shp, dbf);
        return parsed;
      }
    }),
  );

  return geojson.length === 1 ? geojson[0] : geojson;
}

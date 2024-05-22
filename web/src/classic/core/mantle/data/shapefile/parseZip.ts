import JSZip from "jszip";
import proj4 from "proj4";

import { parseDbf } from "./parseDbf";
import { parseShp } from "./parseShp";
import { combine } from "./shapefile";

export async function parseZip(
  buffer: ArrayBuffer | Buffer,
): Promise<GeoJSON.GeoJSON | GeoJSON.GeoJSON[]> {
  const zip = await JSZip.loadAsync(buffer);
  const names: string[] = [];
  const projections: { [key: string]: proj4.Converter } = {};

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
    } else if (key.slice(-5).toLowerCase() === ".json") {
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
        parsed.name = name.slice(0, lastDotIdx);
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

        const shp = parseShp(shpBuffer, prj);
        const dbf = dbfBuffer ? parseDbf(dbfBuffer, cpgString) : undefined;

        const parsed = combine(shp, dbf);
        return parsed;
      }
    }),
  );

  return geojson.length === 1 ? geojson[0] : geojson;
}

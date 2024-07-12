import type { Feature as GeoJSONFeature, Point } from "geojson";

import type { Data, DataRange, Feature } from "../types";

import { f, FetchOptions, generateRandomString } from "./utils";

export async function fetchCSV(
  data: Data,
  range?: DataRange,
  options?: FetchOptions,
): Promise<Feature[] | void> {
  if (!data.url) {
    const value = data.value;
    if (typeof value !== "string") {
      const feature = makeFeature(value, range);
      return feature ? [feature] : undefined;
    }
    return await parseCSV(value, data.csv, range);
  }
  const csvText = await (await f(data.url, options)).text();
  return await parseCSV(csvText, data.csv, range);
}

const parseCSV = async (
  text: string,
  options: Data["csv"],
  range: DataRange | undefined,
): Promise<Feature[] | void> => {
  const { parse } = await import("csv-parse");
  return new Promise((resolve, reject) => {
    const result: Feature[] = [];

    const parser = parse({
      // Referring this specification https://csv-spec.org/.
      delimiter: [",", ";", "\t"],
    });

    let headerKeys: string[] | undefined;

    // Use the readable stream api to consume records
    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        if (!headerKeys) {
          if (!options?.noHeader) {
            headerKeys = record;
            continue;
          }
          headerKeys = [];
        }
        const value = makeGeoJSONFromArray(headerKeys, record, options);
        const feature = makeFeature(value, range);
        if (feature) {
          result.push(feature);
        }
      }
    });

    // Catch any error
    parser.on("error", err => {
      reject(`${err.name} is occurred while parsing CSV: ${err.message}`);
    });

    parser.on("end", () => {
      resolve(result);
    });

    parser.write(text);

    parser.end();
  });
};

const SUPPORTED_COORDINATES = {
  lng: 0,
  lat: 1,
  height: 2,
} as const;

const setCoordinatesToPointGeometry = (
  geometry: Point | null,
  value: any,
  coordIdx: (typeof SUPPORTED_COORDINATES)[keyof typeof SUPPORTED_COORDINATES],
  optional?: boolean,
): Point | null => {
  if (geometry === null) {
    return null;
  }
  const coordinate = Number(value);
  if (isNaN(coordinate) || (typeof value !== "number" && !value)) {
    return optional ? geometry : null;
  }
  geometry.coordinates[coordIdx] = coordinate;
  return geometry;
};

type CSVGeoJSONFeature = GeoJSONFeature<Point | null>;

const makeGeoJSONFromArray = (
  headers: string[],
  values: string[],
  options: Data["csv"],
): CSVGeoJSONFeature => {
  const result = values.reduce(
    (result: CSVGeoJSONFeature, element, idx) => {
      let value: string | number = element;
      if (!options?.disableTypeConversion) value = filterNumericString(element);
      if (options?.idColumn !== undefined && [headers[idx], idx].includes(options.idColumn)) {
        return {
          ...result,
          id: value,
        };
      }

      if (options?.lngColumn !== undefined && [headers[idx], idx].includes(options.lngColumn)) {
        return {
          ...result,
          geometry: setCoordinatesToPointGeometry(
            result.geometry,
            value,
            SUPPORTED_COORDINATES.lng,
          ),
        };
      }
      if (options?.latColumn !== undefined && [headers[idx], idx].includes(options.latColumn)) {
        return {
          ...result,
          geometry: setCoordinatesToPointGeometry(
            result.geometry,
            value,
            SUPPORTED_COORDINATES.lat,
          ),
        };
      }
      if (
        options?.heightColumn !== undefined &&
        [headers[idx], idx].includes(options.heightColumn)
      ) {
        return {
          ...result,
          geometry: setCoordinatesToPointGeometry(
            result.geometry,
            value,
            SUPPORTED_COORDINATES.height,
            true,
          ),
        };
      }

      return {
        ...result,
        properties: {
          ...result.properties,
          ...(headers[idx] ? { [headers[idx]]: value } : {}),
        },
      };
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [],
      },
      properties: {},
    },
  );
  if ((result.geometry?.coordinates.length || 0) < 2) {
    result.geometry = null;
  }
  return result;
};

const makeFeature = (value: CSVGeoJSONFeature, range: DataRange | undefined): Feature | void => {
  if (value.type !== "Feature") {
    return;
  }

  const geo = value.geometry;
  return {
    type: "feature",
    id: (value.id && String(value.id)) || generateRandomString(12),
    geometry: geo ?? undefined,
    properties: value.properties,
    range,
  };
};

const filterNumericString = (input: string): number | string => {
  const parsed = Number(input);
  if (isNaN(parsed) || input === "") {
    return input;
  }
  return parsed;
};

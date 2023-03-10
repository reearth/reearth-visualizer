import { XMLParser, X2jOptionsOptional } from "fast-xml-parser";

import type { Data, DataRange, Feature, Geometry } from "../types";

import { f, convertToCoordinates, FetchOptions } from "./utils";

export async function fetchGMLData(
  data: Data,
  _range?: DataRange,
  options?: FetchOptions,
): Promise<Feature[] | void> {
  const xmlDataStr = data.url ? await (await f(data.url, options)).text() : data.value;
  return handler(xmlDataStr);
}

function handler(xmlDataStr: string) {
  const cleanXml = xmlDataStr.replace(/([a-zA-Z]+:)/g, "");

  const gmlData = parseBuffer(cleanXml);
  return transform(gmlData);
}

function parseBuffer(xmlDataStr: string) {
  const options: X2jOptionsOptional = {
    ignoreAttributes: false,
    attributeNamePrefix: "",
  };
  const parser = new XMLParser(options);
  return parser.parse(xmlDataStr) as GMLFeatureCollection;
}

function transform(gmlFeatureCollection: GMLFeatureCollection): Feature[] {
  const stations = gmlFeatureCollection.FeatureCollection.featureMember;
  const result: Feature[] = [];

  if (stations) {
    for (const station of stations) {
      const {
        Shape: shape,
        name: name,
        WMO_ID: WMO_ID,
        alternative_ID: alternative_ID,
        elevation: elevation,
        hash: hash,
        fid: fid,
      } = station["stations_mix-obs"];
      const properties = {
        name,
        WMO_ID,
        alternative_ID,
        elevation,
        hash,
        fid,
      };

      const geometry = getGeometryOfItem(shape);

      const feature: Feature = {
        type: "feature",
        id: fid,
        properties,
        geometry,
      };
      result.push(feature);
    }
  }
  return result;
}

export function getGeometryOfItem(shape: Shape): Geometry {
  let geometry: Geometry = {
    type: "Point",
    coordinates: [1],
  };

  if ("Point" in shape) {
    const coordinates = getCoordinatesFromPoint(shape.Point);
    if (coordinates) {
      geometry = {
        type: "Point",
        coordinates: convertToCoordinates(coordinates),
      };
    }
  } else if ("MultiPoint" in shape) {
    geometry = {
      type: "MultiPoint",
      coordinates: shape.MultiPoint.pointMember.map(point => {
        const coordinates = getCoordinatesFromPoint(point.Point);
        return convertToCoordinates(coordinates);
      }),
    };
  } else if ("LineString" in shape) {
    const lineString = shape.LineString;
    geometry = {
      type: "LineString",
      coordinates: lineString.posList.split(" ").map(point => convertToCoordinates(point)),
    };
  } else if ("MultiLineString" in shape) {
    geometry = {
      type: "MultiLineString",
      coordinates: shape.MultiLineString.lineStringMember.map(lineString => {
        const line = lineString.LineString;
        return line.posList.split(" ").map(point => convertToCoordinates(point));
      }),
    };
  } else if ("MultiPolygon" in shape) {
    let interior: number[][][] = [[[1]]];
    geometry = {
      type: "MultiPolygon",
      coordinates: shape.MultiPolygon.polygonMember.map(polygon => {
        const exterior = polygon.Polygon.exterior.LinearRing.posList
          .split(" ")
          .map(point => convertToCoordinates(point));
        if (polygon.Polygon.interior) {
          interior = polygon.Polygon.interior.map(interiorRing => {
            const ring = interiorRing.LinearRing;
            return ring.posList.split(" ").map(point => convertToCoordinates(point));
          });
        }
        return [exterior, ...interior];
      }),
    };
  } else if ("Polygon" in shape) {
    const polygon = shape.Polygon;
    const exterior = polygon.exterior.LinearRing.posList
      .split(" ")
      .map(point => convertToCoordinates(point));
    let interior: number[][][] = [[[]]];
    if (polygon.interior) {
      interior = polygon.interior.map(interiorRing => {
        const ring = interiorRing.LinearRing;
        return ring.posList.split(" ").map(point => convertToCoordinates(point));
      });
    }
    geometry = {
      type: "Polygon",
      coordinates: [exterior, ...interior],
    };
  } else {
    throw new Error("unsupported shape");
  }

  return geometry;
}

function getCoordinatesFromPoint(point: Coordinates) {
  if (point.coordinates) {
    return point.coordinates;
  } else if (point.pos) {
    return point.pos;
  }
  throw new Error("something went wrong");
}

type Xml = {
  version: string;
  encoding: string;
};

type Coordinates = {
  pos?: string;
  coordinates?: string;
  srsName?: string;
};

type Point = {
  Point: Coordinates;
};

type MultiPoint = {
  MultiPoint: {
    pointMember: Point[];
  };
};

type LineString = {
  LineString: Coordinates & {
    posList: string;
  };
};

type MultiLineString = {
  MultiLineString: {
    lineStringMember: LineString[];
  };
};

type Polygon = {
  Polygon: {
    exterior: {
      LinearRing: Coordinates & {
        posList: string;
      };
    };
    interior?: {
      LinearRing: Coordinates & {
        posList: string;
      };
    }[];
  };
};

type MultiPolygon = {
  MultiPolygon: {
    polygonMember: Polygon[];
  };
};

export type Shape = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon;

type StationsMixObs = {
  "stations_mix-obs": {
    Shape: Shape;
    name?: string;
    WMO_ID?: number;
    alternative_ID?: string;
    elevation?: string;
    hash?: number;
    fid: string;
  };
};

type Box = {
  Box: Coordinates;
};

type BoundedBy = {
  boundedBy: Box;
};

type FeatureCollection1 = {
  boundedBy: BoundedBy;
  featureMember?: StationsMixObs[];
  "xmlns:mm": string;
  "xmlns:gml": string;
  "xmlns:wfs": string;
  "xmlns:xsi": string;
  "xsi:schemaLocation": string;
};

type GMLFeatureCollection = {
  "?xml": Xml;
  FeatureCollection: FeatureCollection1;
};

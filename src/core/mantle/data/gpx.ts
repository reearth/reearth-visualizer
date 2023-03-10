import { XMLParser, X2jOptionsOptional } from "fast-xml-parser";
import type { LineString, Position, GeoJsonProperties } from "geojson";

import type { Data, DataRange, Feature } from "../types";

import { f, FetchOptions, generateRandomString } from "./utils";

export async function fetchGPXfile(
  data: Data,
  _range?: DataRange,
  options?: FetchOptions,
): Promise<Feature[] | void> {
  const xmlDataStr = data.url ? await (await f(data.url, options)).text() : data.value;
  return handler(xmlDataStr);
}

function handler(xmlDataStr: string) {
  const gpxData = parseBuffer(xmlDataStr);
  return transform(gpxData);
}

function parseBuffer(xmlDataStr: string) {
  const options: X2jOptionsOptional = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  };
  const parser = new XMLParser(options);
  return parser.parse(xmlDataStr) as GPX;
}

function transform(gpxFile: GPX) {
  const trackPoints = makeTrackPoints(gpxFile.gpx.trk);
  const lineStringFeatures = trackPoints.reduce(makeLineStringFeature, []);
  return lineStringFeatures;
}

type TrackPoint = {
  "@_lat": string;
  "@_lon": string;
  ele: number;
  time: string;
  // course: 23.26,
  // speed: 0.63,
  // fix: '3d',
  // sat: 5,
  // hdop: 1.4
};

type Track = {
  trkseg: {
    trkpt: TrackPoint[];
  };
};

type GPX = {
  gpx: {
    trk: Track;
  };
};

function makeTrackPoints(trk: GPX["gpx"]["trk"]) {
  const trkData = [trk];
  return trkData.reduce((trackPoints: any[], { trkseg: { trkpt } }: any) => {
    if (Array.isArray(trkpt)) {
      trackPoints.push(...trkpt);
    } else {
      trackPoints.push(trkpt);
    }
    return trackPoints;
  }, [] as TrackPoint[]);
}

function feature(geom: LineString, properties?: GeoJsonProperties): Feature {
  const feat: Feature = { type: "feature", id: generateRandomString(12) };
  feat.properties = properties || {};
  feat.geometry = geom;
  return feat;
}

function lineString(coordinates: Position[], properties?: GeoJsonProperties): Feature {
  if (coordinates.length < 2) {
    throw new Error("coordinates must be an array of two or more positions");
  }
  const geom: LineString = {
    type: "LineString",
    coordinates,
  };
  return feature(geom, properties);
}

function makeLineStringFeature(
  accumulator: Feature[],
  currentValue: TrackPoint,
  index: number,
  trackPoints: TrackPoint[],
) {
  accumulator.push(
    lineString(getRecords(trackPoints, index).map(getPosition), mapProperties(currentValue)),
  );
  return accumulator;
}

function getPosition({ "@_lon": lon, "@_lat": lat, ele }: TrackPoint): Position {
  const position = [Number(lon), Number(lat)];
  if (ele !== undefined) position.push(Number(ele));
  return position;
}

function getRecords(trackPoints: TrackPoint[], index: number) {
  if (index > 0) {
    return [trackPoints[index - 1], trackPoints[index]];
  }
  if (trackPoints.length === 1) {
    return [trackPoints[index], trackPoints[index]];
  }
  return [trackPoints[index], trackPoints[index + 1]];
}

function mapProperties(trackPoint: GeoJsonProperties) {
  return {
    ...trackPoint,
    timestamp: trackPoint?.time as string,
  };
}

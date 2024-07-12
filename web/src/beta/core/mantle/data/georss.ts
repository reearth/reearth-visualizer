import { XMLParser, X2jOptionsOptional } from "fast-xml-parser";

import type { Data, DataRange, Feature, Geometry } from "../types";

import { getGeometryOfItem } from "./gml";
import type { Shape } from "./gml";
import { f, convertToCoordinates, FetchOptions } from "./utils";

export async function fetchGeoRSS(
  data: Data,
  _range?: DataRange,
  options?: FetchOptions,
): Promise<Feature[] | void> {
  const xmlDataStr = data.url ? await (await f(data.url, options)).text() : data.value;
  return handler(xmlDataStr);
}

function handler(xmlDataStr: string) {
  const cleanXml = xmlDataStr.replace(/([a-zA-Z]+:)/g, "");
  const geoRSSData = parseBuffer(cleanXml);
  if ("rss" in geoRSSData) {
    return parseGeoRSS2(geoRSSData as GeoRSS2);
  } else if ("feed" in geoRSSData) {
    return parseGeoRSSAtom(geoRSSData as GeoRSSAtom);
  } else {
    throw new Error("GeoRSS format not supported");
  }
}

function parseBuffer(xmlDataStr: string) {
  const options: X2jOptionsOptional = {
    ignoreAttributes: false,
    attributeNamePrefix: "",
  };
  const parser = new XMLParser(options);
  return parser.parse(xmlDataStr);
}

function parseGeoRSSAtom(geoRSS: GeoRSSAtom): Feature[] {
  const { entry } = geoRSS.feed;
  return parserEntries(entry);
}

function parseGeoRSS2(geoRSS: GeoRSS2) {
  const item = geoRSS.rss.channel.item;
  return parserEntries(item);
}

function parserEntries(entry: Entry[]) {
  const result: Feature[] = [];
  for (const item of entry) {
    let geometry: Geometry = {
      type: "Point",
      coordinates: [1, 1],
    };

    if (item.where) {
      const shape = item.where;
      geometry = getGeometryOfItem(shape);
    } else if (item.point) {
      geometry = {
        type: "Point",
        coordinates: convertToCoordinates(item.point),
      };
    } else if (item.line) {
      geometry = {
        type: "LineString",
        coordinates: item.line.split(" ").map(point => convertToCoordinates(point)),
      };
    } else if (item.polygon || item.box) {
      let coordinates = [0];
      if (item.polygon) {
        coordinates = convertToCoordinates(item.polygon);
      } else if (item.box) {
        coordinates = convertToCoordinates(item.box);
      }
      geometry = {
        type: "Polygon",
        coordinates: [
          [
            [coordinates[1], coordinates[0]],
            [coordinates[3], coordinates[2]],
            [coordinates[5], coordinates[4]],
            [coordinates[1], coordinates[0]],
          ],
        ],
      };
    }

    const feature: Feature = {
      type: "feature",
      id: item.id,
      properties: {
        title: item.title,
        link: item.link.href,
        id: item.id,
        updated: item.updated,
        content: item.content,
      },
      geometry,
    };

    result.push(feature);
  }

  return result;
}

type Link = {
  href: string;
};

type Author = {
  name: string;
  email: string;
};

type Entry = {
  title: string;
  link: Link;
  id: string;
  updated: string;
  content: string;
  where?: Shape;
  point?: string;
  line?: string;
  polygon?: string;
  box?: string;
  Point?: {
    lat: number;
    long: number;
  };
  lat_long?: string;
};

type Feed = {
  title: string;
  subtitle: string;
  link: Link[];
  updated: string;
  author: Author;
  entry: Entry[];
  xmlns: string;
  georss: string;
  gml: string;
  geo: string;
};

type GeoRSSAtom = {
  feed: Feed;
};

type GeoRSS2 = {
  rss: RSS;
};

type RSS = {
  channel: Channel;
  xmlns: string;
  georss: string;
  gml: string;
  geo: string;
};

type Channel = {
  title: string;
  subtitle: string;
  link: Link[];
  updated: string;
  author: Author;
  item: Entry[];
};

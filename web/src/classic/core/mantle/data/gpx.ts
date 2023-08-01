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

const handler = (xmlDataStr: string) => {
  const [featureList, error] = parseGPX(xmlDataStr);
  if (error) throw error;
  if (featureList instanceof Error) throw featureList;
  return featureList || [];
};

const parseGPX = (gpxSource: string) => {
  const parseMethod = (gpxSource: string): Document | null => {
    if (typeof document == undefined) return null;

    const domParser = new window.DOMParser();
    return domParser.parseFromString(gpxSource, "text/xml");
  };

  return parseGPXWithCustomParser(gpxSource, parseMethod);
};

const parseGPXWithCustomParser = (
  gpxSource: string,
  parseGPXToXML: (gpxSource: string) => Document | null,
) => {
  const parsedSource = parseGPXToXML(gpxSource);

  if (parsedSource === null) return [null, new Error("Provided parsing method failed.")];

  const output: ParsedGPXInputs = {
    xml: parsedSource,
    metadata: {
      name: "",
      description: "",
      time: "",
      author: null,
      link: null,
    },
    waypoints: [],
    tracks: [],
    routes: [],
  };

  const metadata = output.xml.querySelector("metadata");
  if (metadata !== null) {
    output.metadata.name = getElementValue(metadata, "name");
    output.metadata.description = getElementValue(metadata, "desc");
    output.metadata.time = getElementValue(metadata, "time");

    const authorElement = metadata.querySelector("author");
    if (authorElement !== null) {
      const emailElement = authorElement.querySelector("email");
      const linkElement = authorElement.querySelector("link");

      output.metadata.author = {
        name: getElementValue(authorElement, "name"),
        email:
          emailElement !== null
            ? {
                id: emailElement.getAttribute("id") ?? "",
                domain: emailElement.getAttribute("domain") ?? "",
              }
            : null,
        link:
          linkElement !== null
            ? {
                href: linkElement.getAttribute("href") ?? "",
                text: getElementValue(linkElement, "text"),
                type: getElementValue(linkElement, "type"),
              }
            : null,
      };
    }

    const linkElement = queryDirectSelector(metadata, "link");
    if (linkElement !== null) {
      output.metadata.link = {
        href: linkElement.getAttribute("href") ?? "",
        text: getElementValue(linkElement, "text"),
        type: getElementValue(linkElement, "type"),
      };
    }
  }

  const waypoints = Array.from(output.xml.querySelectorAll("wpt"));
  for (const waypoint of waypoints) {
    const point: Waypoint = {
      name: getElementValue(waypoint, "name"),
      symbol: getElementValue(waypoint, "sym"),
      latitude: parseFloat(waypoint.getAttribute("lat") ?? "0"),
      longitude: parseFloat(waypoint.getAttribute("lon") ?? "0"),
      elevation: null,
      comment: getElementValue(waypoint, "cmt"),
      description: getElementValue(waypoint, "desc"),
      time: null,
    };

    const rawElevation = parseFloat(getElementValue(waypoint, "ele")) || 0;
    point.elevation = isNaN(rawElevation) ? null : rawElevation;

    const rawTime = getElementValue(waypoint, "time");
    point.time = rawTime == null ? null : new Date(rawTime);

    output.waypoints.push(point);
  }

  const routes = Array.from(output.xml.querySelectorAll("rte"));
  for (const routeElement of routes) {
    const route: Route = {
      name: getElementValue(routeElement, "name"),
      comment: getElementValue(routeElement, "cmt"),
      description: getElementValue(routeElement, "desc"),
      src: getElementValue(routeElement, "src"),
      number: getElementValue(routeElement, "number"),
      type: null,
      link: null,
      points: [],
      distance: {
        cumulative: [],
        total: 0,
      },
      elevation: {
        maximum: null,
        minimum: null,
        average: null,
        positive: null,
        negative: null,
      },
      slopes: [],
    };

    const type = queryDirectSelector(routeElement, "type");
    route.type = type !== null ? type.innerHTML : null;

    const linkElement = routeElement.querySelector("link");
    if (linkElement !== null) {
      route.link = {
        href: linkElement.getAttribute("href") ?? "",
        text: getElementValue(linkElement, "text"),
        type: getElementValue(linkElement, "type"),
      };
    }

    const routePoints = Array.from(routeElement.querySelectorAll("rtept"));
    for (const routePoint of routePoints) {
      const point: Point = {
        latitude: parseFloat(routePoint.getAttribute("lat") ?? "0"),
        longitude: parseFloat(routePoint.getAttribute("lon") ?? "0"),
        elevation: null,
        time: null,
        extensions: null,
      };

      const rawElevation = parseFloat(getElementValue(routePoint, "ele") ?? "0");
      point.elevation = isNaN(rawElevation) ? null : rawElevation;

      const rawTime = getElementValue(routePoint, "time");
      point.time = rawTime == null ? null : new Date(rawTime);

      route.points.push(point);
    }

    route.distance = calculateDistance(route.points);
    route.elevation = calculateElevation(route.points);
    route.slopes = calculateSlopes(route.points, route.distance.cumulative);

    output.routes.push(route);
  }

  const tracks = Array.from(output.xml.querySelectorAll("trk"));
  for (const trackElement of tracks) {
    const track: Track = {
      name: getElementValue(trackElement, "name"),
      comment: getElementValue(trackElement, "cmt"),
      description: getElementValue(trackElement, "desc"),
      src: getElementValue(trackElement, "src"),
      number: getElementValue(trackElement, "number"),
      type: null,
      link: null,
      points: [],
      distance: {
        cumulative: [],
        total: 0,
      },
      elevation: {
        maximum: null,
        minimum: null,
        average: null,
        positive: null,
        negative: null,
      },
      slopes: [],
    };

    const type = queryDirectSelector(trackElement, "type");
    track.type = type !== null ? type.innerHTML : null;

    const linkElement = trackElement.querySelector("link");
    if (linkElement !== null) {
      track.link = {
        href: linkElement.getAttribute("href") ?? "",
        text: getElementValue(linkElement, "text"),
        type: getElementValue(linkElement, "type"),
      };
    }

    const trackPoints = Array.from(trackElement.querySelectorAll("trkpt"));
    for (const trackPoint of trackPoints) {
      const point: Point = {
        latitude: parseFloat(trackPoint.getAttribute("lat") ?? "0"),
        longitude: parseFloat(trackPoint.getAttribute("lon") ?? "0"),
        elevation: null,
        time: null,
        extensions: null,
      };

      const extensionsElement = trackPoint.querySelector("extensions");
      if (extensionsElement !== null) {
        const extensions: any = {};

        for (const extension of Array.from(extensionsElement.childNodes)) {
          const name = extension.nodeName;

          extensions[name] = parseFloat(
            (extension as Element).innerHTML != undefined
              ? (extension as Element).innerHTML
              : (extension as Element).childNodes[0].textContent ?? "",
          );
        }

        point.extensions = extensions;
      }

      const rawElevation = parseFloat(getElementValue(trackPoint, "ele")) || 0;
      point.elevation = isNaN(rawElevation) ? null : rawElevation;

      const rawTime = getElementValue(trackPoint, "time");
      point.time = rawTime == null ? null : new Date(rawTime);

      track.points.push(point);
    }

    track.distance = calculateDistance(track.points);
    track.elevation = calculateElevation(track.points);
    track.slopes = calculateSlopes(track.points, track.distance.cumulative);

    output.tracks.push(track);
  }

  return [listFeatureCollection(output), null];
};

const listFeatureCollection = (output: ParsedGPXInputs) => {
  const result: Feature[] = [];

  const addFeature = (track: Track | Route) => {
    const { name, comment, description, src, number, link, type, points } = track;
    const coordinates: Position[] = [];
    const properties: GeoJsonProperties = {
      name,
      comment,
      description,
      src,
      number,
      link,
      type,
    };
    for (const point of points) {
      const { longitude, latitude, elevation } = point;
      const position: Position = [Number(longitude), Number(latitude), Number(elevation)];
      coordinates.push(position);
    }

    result.push(getLineStringFeature(coordinates, properties));
  };

  for (const track of [...output.tracks, ...output.routes]) {
    addFeature(track);
  }

  for (const waypoint of output.waypoints) {
    const { name, symbol, comment, description, longitude, latitude, elevation } = waypoint;

    const feature: Feature = {
      type: "feature",
      id: generateRandomString(12),
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude, elevation || 0],
      },
      properties: { name, symbol, comment, description },
    };

    result.push(feature);
  }

  return result;
};

const getElementValue = (parent: Element, tag: string): string => {
  const element = parent.querySelector(tag);

  if (element !== null) {
    return element.innerHTML != undefined
      ? element.innerHTML
      : element.childNodes[0].textContent ?? "";
  } else return "";
};

const queryDirectSelector = (parent: Element, tag: string): Element | null => {
  const elements = parent.querySelectorAll(tag);

  if (elements.length === 0) return null;

  let finalElem = elements[0];

  if (elements.length > 1) {
    const directChildren = parent.childNodes;

    for (const child of Array.from(directChildren)) {
      if ((child as Element).tagName === tag.toUpperCase()) {
        finalElem = child as Element;
      }
    }
  }

  return finalElem;
};

const calculateDistance = (points: Point[]): Distance => {
  const cumulativeDistance = [0];

  for (let i = 0; i < points.length - 1; i++) {
    const currentTotalDistance =
      cumulativeDistance[i] + haversineDistance(points[i], points[i + 1]);
    cumulativeDistance.push(currentTotalDistance);
  }

  return {
    cumulative: cumulativeDistance,
    total: cumulativeDistance[cumulativeDistance.length - 1],
  };
};

const haversineDistance = (point1: Point, point2: Point): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const lat1Radians = toRadians(point1.latitude);
  const lat2Radians = toRadians(point2.latitude);
  const sinDeltaLatitude = Math.sin(toRadians(point2.latitude - point1.latitude) / 2);
  const sinDeltaLongitude = Math.sin(toRadians(point2.longitude - point1.longitude) / 2);
  const a =
    sinDeltaLatitude ** 2 + Math.cos(lat1Radians) * Math.cos(lat2Radians) * sinDeltaLongitude ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371000 * c;
};

const calculateElevation = (points: Point[]): Elevation => {
  let dp = 0;
  let dn = 0;
  const elevation = [];
  let sum = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const nextElevation = points[i + 1]?.elevation;
    const currentElevation = points[i]?.elevation;

    if (nextElevation !== null && currentElevation !== null) {
      const diff = nextElevation - currentElevation;
      if (diff < 0) dn += diff;
      else if (diff > 0) dp += diff;
    }
  }

  for (const point of points) {
    if (point.elevation !== null) {
      elevation.push(point.elevation);
      sum += point.elevation;
    }
  }

  return {
    maximum: elevation.length ? Math.max(...elevation) : null,
    minimum: elevation.length ? Math.min(...elevation) : null,
    positive: Math.abs(dp) || null,
    negative: Math.abs(dn) || null,
    average: elevation.length ? sum / elevation.length : null,
  };
};

const calculateSlopes = (points: Point[], cumulativeDistance: number[]): number[] => {
  const slopes = [];

  for (let i = 0; i < points.length - 1; i++) {
    const nextElevation = points[i + 1]?.elevation;
    const currentElevation = points[i]?.elevation;

    if (nextElevation !== null && currentElevation !== null) {
      const elevationDifference = nextElevation - currentElevation;
      const displacement = cumulativeDistance[i + 1] - cumulativeDistance[i];

      const slope = (elevationDifference * 100) / displacement;
      slopes.push(slope);
    }
  }

  return slopes;
};

const getLineStringFeature = (coordinates: Position[], properties?: GeoJsonProperties): Feature => {
  if (coordinates.length < 2) {
    throw new Error("coordinates must be an array of two or more positions");
  }
  const geom: LineString = {
    type: "LineString",
    coordinates,
  };
  return makeFeature(geom, properties);
};

const makeFeature = (geom: LineString, properties?: GeoJsonProperties): Feature => {
  const feat: Feature = { type: "feature", id: generateRandomString(12) };
  feat.properties = properties || {};
  feat.geometry = geom;
  return feat;
};

type MetaData = {
  name: string;
  description: string;
  link: Link | null;
  author: Author | null;
  time: string;
};

type Waypoint = {
  name: string;
  symbol: string;
  comment: string;
  description: string;
  latitude: number;
  longitude: number;
  elevation: number | null;
  time: Date | null;
};

type Track = {
  name: string;
  comment: string;
  description: string;
  src: string;
  number: string;
  link: Link | null;
  type: string | null;
  points: Point[];
  distance: Distance;
  elevation: Elevation;
  slopes: number[];
};

type Route = {
  name: string;
  comment: string;
  description: string;
  src: string;
  number: string;
  link: Link | null;
  type: string | null;
  points: Point[];
  distance: Distance;
  elevation: Elevation;
  slopes: number[];
};

type Point = {
  latitude: number;
  longitude: number;
  elevation: number | null;
  time: Date | null;
  extensions: {
    [key: string]: number;
  } | null;
};

type Distance = {
  total: number;
  cumulative: number[];
};

type Elevation = {
  maximum: number | null;
  minimum: number | null;
  positive: number | null;
  negative: number | null;
  average: number | null;
};

type Author = {
  name: string | null;
  email: Email | null;
  link: Link | null;
};

type Email = {
  id: string | null;
  domain: string | null;
};

type Link = {
  href: string | null;
  text: string | null;
  type: string | null;
};

type ParsedGPXInputs = {
  xml: Document;
  metadata: MetaData;
  waypoints: Waypoint[];
  tracks: Track[];
  routes: Route[];
};

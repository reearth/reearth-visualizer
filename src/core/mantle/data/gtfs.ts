import Pbf from "pbf";

import type { Data, DataRange, Feature } from "../types";

import { Trips, Trip, GTFS, GTFSReader } from "./gtfsReader";
import { f } from "./utils";

let gtfs: GTFS = {};
let current: Trips = {};
let previous: Trips = {};
let tripsData: Trips = {};

export async function fetchGTFS(data: Data, range?: DataRange): Promise<Feature[] | void> {
  const fetchData = async () => {
    try {
      const arrayBuffer = data.url ? await (await f(data.url)).arrayBuffer() : data.value;
      const pbfBuffer = new Pbf(new Uint8Array(arrayBuffer));
      gtfs = new GTFSReader().read(pbfBuffer);
    } catch (err) {
      throw new Error(`failed to fetch gtfs: ${err}`);
    }
  };
  await fetchData();

  return processGTFS(gtfs, range);
}

export function processGTFS(gtfs?: GTFS, _range?: DataRange): Feature[] | void {
  if (gtfs) {
    if (current) {
      previous = current;
      const currentTrips = GTFStoTrips(gtfs);
      current = currentTrips;
      const merged = mergeTrips(currentTrips, previous);

      tripsData = merged;
    } else {
      const currentTrips = GTFStoTrips(gtfs);
      current = currentTrips;
      tripsData = currentTrips;
    }
  }

  return tripsData?.trips
    ?.filter(f => !!f.properties.position)
    .map(f => {
      return {
        type: "feature",
        id: f.id,
        geometry: {
          type: "Point",
          coordinates: [
            f.properties.position?.longitude || 0,
            f.properties.position?.latitude || 0,
          ],
        },
        properties: f.properties,
      };
    });
}

export const GTFStoTrips = (gtfs: GTFS): Trips => {
  const trips = gtfs.entities?.map(entity => ({
    id: entity.id,
    properties: entity.vehicle,
    path: [[entity.vehicle?.position?.longitude, entity.vehicle?.position?.latitude]],
    timestamps: [entity.vehicle?.timestamp],
  }));
  return {
    timestamp: gtfs.header?.timestamp,
    trips: trips as Trip[],
  };
};

export const mergeTrips = (current: Trips, prev?: Trips) => {
  if (prev) {
    const prevMap = new Map();
    prev?.trips?.forEach(trip => {
      prevMap.set(trip.id, trip);
    });
    const mergedMap = new Map();
    const newIds: string[] = [];
    current?.trips?.forEach(entity => {
      const previousEntity = prevMap.get(entity.id);
      if (previousEntity) {
        const previousPath = previousEntity.path;
        const previousTimestamps = previousEntity.timestamps;
        const trip = {
          id: entity.id,
          properties: entity.properties,
          path: [...previousPath, ...entity.path],
          timestamps: [...previousTimestamps, ...entity.timestamps],
        };
        mergedMap.set(entity.id, trip);
      } else {
        mergedMap.set(entity.id, entity);
        newIds.push(entity.id);
      }
    });
    const trips = Object.fromEntries(mergedMap);
    const mergedTrips = Object.values(trips).filter(
      entity =>
        newIds.includes((entity as Trip).id) ||
        (entity as Trip).path.length > prevMap.get((entity as Trip).id).path.length,
    );
    return {
      timestamp: current.timestamp,
      trips: mergedTrips as Trip[],
    };
  }
  return current;
};

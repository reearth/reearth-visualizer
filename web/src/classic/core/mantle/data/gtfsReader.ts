import Pbf from "pbf";

export type GTFS = {
  header?: Header | null;
  entities?: Entity[];
};

export type Header = {
  gtfs_realtime_version?: string;
  incrementality?: HeaderIncrementality;
  timestamp?: number;
};

export type Entity = {
  id?: string;
  is_deleted?: boolean;
  trip_update?: TripUpdate | null;
  vehicle?: VehiclePosition | null;
  alert?: Alert | null;
};

export type TripUpdate = {
  trip?: TripDescriptor | null;
  vehicle?: VehicleDescriptor | null;
  stop_time_update?: StopTimeUpdate[];
  timestamp?: number;
  delay?: number;
};

export type StopTimeEvent = {
  delay?: number;
  time?: number;
  uncertainty?: number;
};

export type StopTimeUpdate = {
  stop_sequence?: number;
  stop_id?: string;
  arrival?: StopTimeEvent | null;
  departure?: StopTimeEvent | null;
  schedule_relationship?: StopTimeUpdateScheduleRelationship;
};

export type VehiclePosition = {
  trip?: TripDescriptor | null;
  vehicle?: VehicleDescriptor | null;
  position?: Position | null;
  current_stop_sequence?: number;
  stop_id?: string;
  current_status?: VehicleStopStatus;
  timestamp?: number;
  congestion_level?: CongestionLevel;
  occupancy_status?: OccupancyStatus;
};

export type Alert = {
  active_period?: TimeRange[];
  informed_entity?: EntitySelector[];
  cause?: AlertCause;
  effect?: AlertEffect;
  url?: TranslatedString | null;
  header_text?: TranslatedString | null;
  description_text?: TranslatedString | null;
};

export type TimeRange = {
  start?: number;
  end?: number;
};

export type Position = {
  latitude?: number;
  longitude?: number;
  bearing?: number;
  odometer?: number;
  speed?: number;
};

export type TripDescriptor = {
  trip_id?: string;
  route_id?: string;
  direction_id?: number;
  start_time?: string;
  start_date?: string;
  schedule_relationship?: TripDescriptorScheduleRelationship;
};

export type VehicleDescriptor = {
  id?: string;
  label?: string;
  license_plate?: string;
};

export type EntitySelector = {
  agency_id?: string;
  route_id?: string;
  route_type?: number;
  trip?: TripDescriptor | null;
  stop_id?: string;
};

export type TranslatedString = {
  translation?: Translation[];
};

export type Translation = {
  text?: string;
  language?: string;
};

export type Trips = {
  timestamp?: number;
  trips?: Trip[];
};

export type Trip = {
  id: string;
  properties: VehiclePosition;
  path: [number, number][];
  timestamps: number[];
};

export abstract class ProtobufMessageReader<T> {
  abstract readonly defaultMessage: T;

  public read(pbf: Pbf, end?: number): T {
    return pbf.readFields(this.readField, this.defaultMessage, end);
  }

  protected abstract readField(tag: number, obj?: T, pbf?: Pbf): void;
}

export class GTFSReader extends ProtobufMessageReader<GTFS> {
  readonly defaultMessage: GTFS = {
    header: null,
    entities: [],
  };

  protected readField(tag: number, obj = {} as GTFS, pbf: Pbf): void {
    if (tag === 1) obj.header = new HeaderReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2)
      obj.entities?.push(new EntityReader().read(pbf, pbf.readVarint() + pbf.pos));
  }
}

enum HeaderIncrementality {
  FULL_DATASET,
  DIFFERENTIAL,
}

export class HeaderReader extends ProtobufMessageReader<Header> {
  readonly defaultMessage: Header = {
    gtfs_realtime_version: "",
    incrementality: HeaderIncrementality.FULL_DATASET,
    timestamp: 0,
  };

  protected readField(tag: number, obj = {} as Header, pbf: Pbf): void {
    if (tag === 1) obj.gtfs_realtime_version = pbf.readString();
    else if (tag === 2) obj.incrementality = pbf.readVarint();
    else if (tag === 3) obj.timestamp = pbf.readVarint();
  }
}

export class EntityReader extends ProtobufMessageReader<Entity> {
  readonly defaultMessage: Entity = {
    id: "",
    is_deleted: false,
    trip_update: null,
    vehicle: null,
    alert: null,
  };

  protected readField(tag: number, obj = {} as Entity, pbf: Pbf): void {
    if (tag === 1) obj.id = pbf.readString();
    else if (tag === 2) obj.is_deleted = pbf.readBoolean();
    else if (tag === 3)
      obj.trip_update = new TripUpdateReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 4)
      obj.vehicle = new VehiclePositionReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5) obj.alert = new AlertReader().read(pbf, pbf.readVarint() + pbf.pos);
  }
}

export class TripUpdateReader extends ProtobufMessageReader<TripUpdate> {
  readonly defaultMessage: TripUpdate = {
    trip: {},
    vehicle: {},
    stop_time_update: [],
    timestamp: 0,
    delay: 0,
  };

  protected readField(tag: number, obj = {} as TripUpdate, pbf: Pbf): void {
    if (tag === 1) obj.trip = new TripDescriptorReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3)
      obj.vehicle = new VehicleDescriptorReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2)
      obj.stop_time_update?.push(new StopTimeUpdateReader().read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 4) obj.timestamp = pbf.readVarint();
    else if (tag === 5) obj.delay = pbf.readVarint(true);
  }
}

export class StopTimeEventReader extends ProtobufMessageReader<StopTimeEvent> {
  readonly defaultMessage: StopTimeEvent = {
    delay: 0,
    time: 0,
    uncertainty: 0,
  };

  protected readField(tag: number, obj = {} as StopTimeEvent, pbf: Pbf): void {
    if (tag === 1) obj.delay = pbf.readVarint(true);
    else if (tag === 2) obj.time = pbf.readVarint(true);
    else if (tag === 3) obj.uncertainty = pbf.readVarint(true);
  }
}

export class StopTimeUpdateReader extends ProtobufMessageReader<StopTimeUpdate> {
  readonly defaultMessage: StopTimeUpdate = {
    stop_sequence: 0,
    stop_id: "",
    arrival: null,
    departure: null,
    schedule_relationship: StopTimeUpdateScheduleRelationship.NO_DATA,
  };

  protected readField(tag: number, obj = {} as StopTimeUpdate, pbf: Pbf): void {
    if (tag === 1) obj.stop_sequence = pbf.readVarint();
    else if (tag === 4) obj.stop_id = pbf.readString();
    else if (tag === 2)
      obj.arrival = new StopTimeEventReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3)
      obj.departure = new StopTimeEventReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5) obj.schedule_relationship = pbf.readVarint();
  }
}

enum StopTimeUpdateScheduleRelationship {
  SCHEDULED,
  SKIPPED,
  NO_DATA,
}

export class VehiclePositionReader extends ProtobufMessageReader<VehiclePosition> {
  readonly defaultMessage: VehiclePosition = {
    trip: null,
    vehicle: null,
    position: null,
    current_stop_sequence: 0,
    stop_id: "",
    current_status: VehicleStopStatus.IN_TRANSIT_TO,
    timestamp: 0,
    congestion_level: CongestionLevel.UNKNOWN_CONGESTION_LEVEL,
    occupancy_status: OccupancyStatus.EMPTY,
  };

  protected readField(tag: number, obj = {} as VehiclePosition, pbf: Pbf): void {
    if (tag === 1) obj.trip = new TripDescriptorReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 8)
      obj.vehicle = new VehicleDescriptorReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2) obj.position = new PositionReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3) obj.current_stop_sequence = pbf.readVarint();
    else if (tag === 7) obj.stop_id = pbf.readString();
    else if (tag === 4) obj.current_status = pbf.readVarint();
    else if (tag === 5) obj.timestamp = pbf.readVarint();
    else if (tag === 6) obj.congestion_level = pbf.readVarint();
    else if (tag === 9) obj.occupancy_status = pbf.readVarint();
  }
}

export enum VehicleStopStatus {
  INCOMING_AT,
  STOPPED_AT,
  IN_TRANSIT_TO,
}

export enum CongestionLevel {
  UNKNOWN_CONGESTION_LEVEL,
  RUNNING_SMOOTHLY,
  STOP_AND_GO,
  CONGESTION,
  SEVERE_CONGESTION,
}

export enum OccupancyStatus {
  EMPTY,
  MANY_SEATS_AVAILABLE,
  FEW_SEATS_AVAILABLE,
  STANDING_ROOM_ONLY,
  CRUSHED_STANDING_ROOM_ONLY,
  FULL,
  NOT_ACCEPTING_PASSENGERS,
}

export class AlertReader extends ProtobufMessageReader<Alert> {
  readonly defaultMessage: Alert = {
    active_period: [],
    informed_entity: [],
    cause: AlertCause.CONSTRUCTION,
    effect: AlertEffect.STOP_MOVED,
    url: null,
    header_text: null,
    description_text: null,
  };

  protected readField(tag: number, obj = {} as Alert, pbf: Pbf): void {
    if (tag === 1)
      obj.active_period?.push(new TimeRangeReader().read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 5)
      obj.informed_entity?.push(new EntitySelectorReader().read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 6) obj.cause = pbf.readVarint();
    else if (tag === 7) obj.effect = pbf.readVarint();
    else if (tag === 8)
      obj.url = new TranslatedStringReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 10)
      obj.header_text = new TranslatedStringReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 11)
      obj.description_text = new TranslatedStringReader().read(pbf, pbf.readVarint() + pbf.pos);
  }
}

enum AlertCause {
  UNKNOWN_CAUSE = 1,
  OTHER_CAUSE,
  TECHNICAL_PROBLEM,
  STRIKE,
  DEMONSTRATION,
  ACCIDENT,
  HOLIDAY,
  WEATHER,
  MAINTENANCE,
  CONSTRUCTION,
  POLICE_ACTIVITY,
  MEDICAL_EMERGENCY,
}

enum AlertEffect {
  NO_SERVICE = 1,
  REDUCED_SERVICE,
  SIGNIFICANT_DELAYS,
  ADDITIONAL_SERVICE,
  MODIFIED_SERVICE,
  OTHER_EFFECT,
  UNKNOWN_EFFECT,
  STOP_MOVED,
}

export class TimeRangeReader extends ProtobufMessageReader<TimeRange> {
  readonly defaultMessage: TimeRange = {
    start: 0,
    end: 0,
  };

  protected readField(tag: number, obj = {} as TimeRange, pbf: Pbf): void {
    if (tag === 1) obj.start = pbf.readVarint();
    else if (tag === 2) obj.end = pbf.readVarint();
  }
}

export class PositionReader extends ProtobufMessageReader<Position> {
  readonly defaultMessage: Position = {
    latitude: 0,
    longitude: 0,
    bearing: 0,
    odometer: 0,
    speed: 0,
  };

  protected readField(tag: number, obj = {} as Position, pbf: Pbf): void {
    if (tag === 1) obj.latitude = pbf.readFloat();
    else if (tag === 2) obj.longitude = pbf.readFloat();
    else if (tag === 3) obj.bearing = pbf.readFloat();
    else if (tag === 4) obj.odometer = pbf.readDouble();
    else if (tag === 5) obj.speed = pbf.readFloat();
  }
}

export class TripDescriptorReader extends ProtobufMessageReader<TripDescriptor> {
  readonly defaultMessage: TripDescriptor = {
    trip_id: "",
    route_id: "",
    direction_id: 0,
    start_time: "",
    start_date: "",
    schedule_relationship: TripDescriptorScheduleRelationship.SCHEDULED,
  };

  protected readField(tag: number, obj = {} as TripDescriptor, pbf: Pbf): void {
    if (tag === 1) obj.trip_id = pbf.readString();
    else if (tag === 5) obj.route_id = pbf.readString();
    else if (tag === 6) obj.direction_id = pbf.readVarint();
    else if (tag === 2) obj.start_time = pbf.readString();
    else if (tag === 3) obj.start_date = pbf.readString();
    else if (tag === 4) obj.schedule_relationship = pbf.readVarint();
  }
}

enum TripDescriptorScheduleRelationship {
  SCHEDULED,
  ADDED,
  UNSCHEDULED,
  CANCELED,
}

export class VehicleDescriptorReader extends ProtobufMessageReader<VehicleDescriptor> {
  readonly defaultMessage: VehicleDescriptor = {
    id: "",
    label: "",
    license_plate: "",
  };

  protected readField(tag: number, obj = {} as VehicleDescriptor, pbf: Pbf): void {
    if (tag === 1) obj.id = pbf.readString();
    else if (tag === 2) obj.label = pbf.readString();
    else if (tag === 3) obj.license_plate = pbf.readString();
  }
}

export class EntitySelectorReader extends ProtobufMessageReader<EntitySelector> {
  readonly defaultMessage: EntitySelector = {
    agency_id: "",
    route_id: "",
    route_type: 0,
    trip: null,
    stop_id: "",
  };

  protected readField(tag: number, obj = {} as EntitySelector, pbf: Pbf): void {
    if (tag === 1) obj.agency_id = pbf.readString();
    else if (tag === 2) obj.route_id = pbf.readString();
    else if (tag === 3) obj.route_type = pbf.readVarint(true);
    else if (tag === 4) obj.trip = new TripDescriptorReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5) obj.stop_id = pbf.readString();
  }
}

export class TranslatedStringReader extends ProtobufMessageReader<TranslatedString> {
  readonly defaultMessage: TranslatedString = { translation: [] };

  protected readField(tag: number, obj = {} as TranslatedString, pbf: Pbf): void {
    if (tag === 1)
      obj.translation?.push(new TranslationReader().read(pbf, pbf.readVarint() + pbf.pos));
  }
}

export class TranslationReader extends ProtobufMessageReader<Translation> {
  readonly defaultMessage: Translation = { text: "", language: "" };

  protected readField(tag: number, obj = {} as Translation, pbf: Pbf): void {
    if (tag === 1) obj.text = pbf.readString();
    else if (tag === 2) obj.language = pbf.readString();
  }
}

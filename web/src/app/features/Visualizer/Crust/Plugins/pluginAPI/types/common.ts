export declare type LatLngHeight = {
  lat: number;
  lng: number;
  height: number;
};

export declare type GeoRect = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export declare type GeoidServer = {
  url: string; // URL of the geoid server. use ${lat} ${lng} for lat/lng placeholders. Example: "https://mock.com/api/altitude?lat=${lat}&lng=${lng}"
  geoidProperty: string; // TODO: support json path
};

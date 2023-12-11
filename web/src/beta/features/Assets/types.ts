export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

export type SortType = "date" | "name" | "size";

export type AcceptedFileFormat = "CSV" | "GeoJSON" | "KML" | "CZML";

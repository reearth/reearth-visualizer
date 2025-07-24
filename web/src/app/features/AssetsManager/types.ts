export type Asset = {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  name: string;
  size: number;
  url: string;
  createdAt: Date;
  contentType: string;
};

export type SortType = "date" | "name" | "size";
export type sortOptionValue =
  | "date"
  | "date-reverse"
  | "name"
  | "name-reverse"
  | "size"
  | "size-reverse";

export type AcceptedFileFormat = "CSV" | "GeoJSON" | "KML" | "CZML";

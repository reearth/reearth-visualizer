export type Type = string;

export type DatasetField = {
  id: string;
  name?: string;
  type: Type;
};

export type Dataset = {
  id: string;
  name?: string;
};

export type DatasetSchema = {
  id: string;
  name?: string;
  datasets?: Dataset[];
  fields?: DatasetField[];
};

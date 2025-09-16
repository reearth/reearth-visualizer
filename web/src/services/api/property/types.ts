import { ValueType, ValueTypes } from "@reearth/app/utils/value";

export type Field<T extends ValueType = ValueType> = {
  id: string;
  type: T;
  value?: ValueTypes[T];
  mergedValue?: ValueTypes[T];
  overridden?: boolean;
  link?: {
    inherited?: boolean;
    schema: string;
    dataset?: string;
    field: string;
    schemaName?: string;
    datasetName?: string;
    fieldName?: string;
  };
};

export type SchemaFieldType<T extends ValueType = ValueType> = {
  id: string;
  type: T;
  defaultValue?: ValueTypes[T];
  prefix?: string;
  suffix?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  isLinkable?: boolean;
  isTemplate?: boolean;
  ui?:
    | "color"
    | "multiline"
    | "selection"
    | "buttons"
    | "range"
    | "slider"
    | "image"
    | "video"
    | "file"
    | "layer"
    | "cameraPose"
    | "padding"
    | "margin"
    | "datetime"
    | "zoomLevel"
    | "propertySelector";
  choices?: {
    key: string;
    label: string;
    icon?: string | undefined;
  }[];
  min?: number;
  max?: number;
};

export type SchemaField<T extends ValueType = ValueType> =
  SchemaFieldType<T> & {
    only?: {
      field: string;
      value: string | boolean;
    };
  };

export type ItemCommon = {
  id?: string;
  schemaGroup: string;
  title?: string;
  collection?: string | null;
  schemaFields: SchemaField[];
  representativeField?: string;
  only?: {
    field: string;
    value: string | boolean;
  };
};

export type GroupListItem = {
  id: string;
  fields: Field[];
};

export type GroupList = {
  items: GroupListItem[];
} & ItemCommon;

export type Group = {
  fields: Field[];
} & ItemCommon;

export type Item = Group | GroupList;

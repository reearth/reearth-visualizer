import Visualizer from "@reearth/beta/features/Visualizer";
import { SpacingValues } from "@reearth/beta/ui/fields/SpacingField";
import { SchemaField } from "@reearth/services/api/propertyApi/utils";
import { ComponentProps } from "react";

import { Field } from "../Visualizer/Crust/StoryPanel/types";
import { LatLng } from "../Visualizer/Crust/types";
import { WidgetLocation } from "../Visualizer/Crust/Widgets/types";

export type ReearthYML = {
  id: string;
  name: string;
  version: string;
  extensions?: {
    id: string;
    type: string;
    name: string;
    description: string;
    widgetLayout?: {
      extended: boolean;
      defaultLocation: {
        zone: WidgetLocation["zone"];
        section: WidgetLocation["section"];
        area: WidgetLocation["area"];
      };
    };
    schema?: {
      groups: Group;
    };
  }[];
};

export type Widgets = ComponentProps<typeof Visualizer>["widgets"];

export type CustomInfoboxBlock = {
  id: string;
  name: string;
  description: string;
  __REEARTH_SOURCECODE: string;
  extensionId: string;
  pluginId: string;
};

export type CustomStoryBlock = CustomInfoboxBlock;

export type FieldValue =
  | string
  | number
  | boolean
  | LatLng
  | number[]
  | string[]
  | SpacingValues;
export interface CustomField extends Field {
  id?: string;
  ui?: string;
  defaultValue?: FieldValue;
}

export interface CustomSchemaField extends SchemaField {
  value?: FieldValue;
}

export type Group = {
  id: string;
  title: string;
  fields: SchemaField[];
}[];

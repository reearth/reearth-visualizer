import Visualizer from "@reearth/beta/features/Visualizer";
import { SchemaField } from "@reearth/services/api/propertyApi/utils";
import { ComponentProps } from "react";

import { Field } from "../Visualizer/Crust/StoryPanel/types";
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

export interface CustomField extends Field {
  id?: string;
  ui?: string;
  defaultValue?: string | number | boolean | null;
}

export type Group = {
  id: string;
  title: string;
  fields: SchemaField[];
}[];

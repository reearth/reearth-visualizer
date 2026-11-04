import type Visualizer from "@reearth/app/features/Visualizer";
import type { Story } from "@reearth/app/features/Visualizer/Crust/StoryPanel";
import type { WidgetLocation } from "@reearth/app/features/Visualizer/Crust/Widgets/types";
import type { ComponentProps } from "react";

export type SchemaFieldDef = {
  id: string;
  type: string;
  title?: string;
  description?: string;
  defaultValue?: unknown;
  placeholder?: string;
  ui?: string;
  choices?: { key: string; label: string }[];
  min?: number;
  max?: number;
  suffix?: string;
};

export type SchemaGroupDef = {
  id: string;
  title?: string;
  list?: boolean;
  representativeField?: string;
  fields: SchemaFieldDef[];
};

/** A value an inspector field can hold. */
export type FieldValue = unknown;

/** Values by key: `<pluginId>-<extensionId>-<groupId>[-<itemId>]-<fieldId>`. */
export type FieldValues = Record<string, FieldValue>;

export type ReearthYML = {
  id: string;
  name?: string;
  version?: string;
  extensions?: {
    id: string;
    type: string;
    name?: string;
    description?: string;
    schema?: { groups: SchemaGroupDef[] };
    widgetLayout?: {
      extended?: boolean;
      defaultLocation?: {
        zone: WidgetLocation["zone"];
        section: WidgetLocation["section"];
        area: WidgetLocation["area"];
      };
    };
  }[];
};

export type PluginExtension = NonNullable<ReearthYML["extensions"]>[number];

export type WorkbenchWidgets = ComponentProps<typeof Visualizer>["widgets"];

export type WorkbenchStory = Story;

export type WorkbenchBlock = {
  id: string;
  name: string;
  description?: string;
  extensionId: string;
  pluginId: string;
  property: Record<string, unknown>;
  propertyForPluginAPI: Record<string, unknown>;
};

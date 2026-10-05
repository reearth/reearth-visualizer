import type Visualizer from "@reearth/app/features/Visualizer";
import type { Story } from "@reearth/app/features/Visualizer/Crust/StoryPanel";
import type { WidgetLocation } from "@reearth/app/features/Visualizer/Crust/Widgets/types";
import type { ComponentProps } from "react";

export type ReearthYML = {
  id: string;
  name?: string;
  version?: string;
  extensions?: {
    id: string;
    type: string;
    name?: string;
    description?: string;
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

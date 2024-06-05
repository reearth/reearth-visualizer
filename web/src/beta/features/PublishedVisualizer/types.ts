import { SceneProperty } from "@reearth/beta/types";
import type { DataRange, DataType, Geometry, TimeInterval } from "@reearth/core";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";

export type PublishedData = {
  schemaVersion: number;
  id: string;
  publishedAt: string;
  property?: SceneProperty;
  plugins?: Record<string, Plugin>;
  nlsLayers?: NLSLayer[];
  layerStyles?: LayerStyle[];
  widgets?: Widget[];
  widgetAlignSystem?: WidgetAlignSystem;
  story?: Story;
  enableGa?: boolean;
  trackingId?: string;
};

export type Story = {
  id: string;
  title?: string;
  position: "left" | "right";
  pages: StoryPage[];
  bgColor?: string;
};

export type StoryPage = {
  id: string;
  swipeable?: boolean;
  swipeableLayers?: string[];
  layers?: string[];
  property?: any;
  blocks: StoryBlock[];
};

export type StoryBlock = {
  id: string;
  name?: string | null;
  pluginId: string;
  extensionId: string;
  propertyId?: string;
  property?: any;
};

export type Plugin = {
  id: string;
  property: any;
};

export type NLSLayer = {
  id: string;
  title: string;
  layerType: "simple";
  isVisible?: boolean;
  config: {
    layerStyleId?: string;
    data: {
      type: DataType;
      url?: string;
      value?: any;
      property?: any;
    };
  };
  isSketch?: boolean;
  sketchInfo?: any;
  nlsInfobox?: any;
};

export type NLSInfobox = {
  id: string;
  blocks: NLSInfoboxBlock[];
  property: any;
};

export type NLSInfoboxBlock = {
  id: string;
  pluginId: string;
  extensionId: string;
  property: any;
};

export type Widget = {
  id: string;
  pluginId: string;
  extensionId: string;
  property: any;
  extended?: boolean;
  extendable?:
    | {
        vertically?: boolean | undefined;
        horizontally?: boolean | undefined;
      }
    | undefined;
  floating?: boolean;
};

export type WidgetAlignSystem = {
  inner?: WidgetZone | null;
  outer?: WidgetZone | null;
};

export type WidgetZone = {
  left?: WidgetSection | null;
  center?: WidgetSection | null;
  right?: WidgetSection | null;
};

export type WidgetSection = {
  top?: WidgetArea | null;
  middle?: WidgetArea | null;
  bottom?: WidgetArea | null;
};

export type WidgetArea = {
  widgetIds: string[];
  align: WidgetAlignment;
  padding?: WidgetAreaPadding;
  gap?: number | null;
  centered?: boolean;
  background?: string;
};

export type WidgetAlignment = "start" | "centered" | "end";

export type WidgetAreaPadding = { top: number; bottom: number; left: number; right: number };

export type Feature = {
  id: string;
  geometry?: Geometry[];
  interval?: TimeInterval;
  properties?: any;
  // Map engine specific information.
  metaData?: {
    description?: string;
  };
  range?: DataRange;
};

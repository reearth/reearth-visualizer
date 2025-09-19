import { SceneProperty } from "@reearth/app/types";
import type {
  DataRange,
  DataType,
  Geometry,
  TimeInterval
} from "@reearth/core";
import type { SketchFeature } from "@reearth/services/api/layer/types";
import type { LayerStyle } from "@reearth/services/api/layerStyle";

// Base type for plugin properties that can have arbitrary structure
export type PluginProperty = Record<string, unknown>;

// Common property structure for features and data
export type Properties = Record<string, unknown>;

// Schema definition for dynamic property structures
export type PropertySchema = {
  type?: string;
  title?: string;
  description?: string;
  properties?: Record<string, PropertySchema>;
  items?: PropertySchema;
  enum?: unknown[];
  default?: unknown;
};

export type PublishedData = {
  schemaVersion: number;
  id: string;
  publishedAt: string;
  property?: SceneProperty;
  plugins?: Record<string, Plugin>;
  nlsLayers?: PublishedNLSLayer[];
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
  property?: Record<string, unknown>;
  blocks: StoryBlock[];
};

export type StoryBlock = {
  id: string;
  name?: string | null;
  pluginId: string;
  extensionId: string;
  propertyId?: string;
  property?: Record<string, unknown>;
};

export type Plugin = {
  id: string;
  property: PluginProperty;
};

export type PublishedNLSLayer = {
  id: string;
  title: string;
  layerType: "simple";
  isVisible?: boolean;
  config: {
    layerStyleId?: string;
    data: {
      type: DataType;
      url?: string;
      value?: unknown;
      property?: Properties;
    };
  };
  isSketch?: boolean;
  sketchInfo?: SketchInfo;
  nlsInfobox?: unknown;
  nlsPhotoOverlay?: {
    id?: string;
    property?: {
      default?: {
        enabled?: boolean;
        cameraDuration?: number;
      };
    };
  };
};

export type SketchInfo = {
  propertySchema?: PropertySchema;
  title?: string;
  featureCollection: {
    type: string;
    features: SketchFeature[];
  };
};

export type PublishedNLSInfobox = {
  id: string;
  blocks: PublishedNLSInfoboxBlock[];
  property: Properties;
};

export type PublishedNLSInfoboxBlock = {
  id: string;
  pluginId: string;
  extensionId: string;
  property: PluginProperty;
};

export type Widget = {
  id: string;
  pluginId: string;
  extensionId: string;
  property: PluginProperty;
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

export type WidgetAreaPadding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type Feature = {
  id: string;
  geometry?: Geometry[];
  interval?: TimeInterval;
  properties?: Properties;
  // Map engine specific information.
  metaData?: {
    description?: string;
  };
  range?: DataRange;
};

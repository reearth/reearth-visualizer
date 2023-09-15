import { Typography } from "@reearth/beta/lib/core/mantle/types/value";
import type { SceneProperty } from "@reearth/classic/components/molecules/Visualizer";
import { Story } from "@reearth/services/gql";

export type PublishedData = {
  schemaVersion: number;
  id: string;
  publishedAt: string;
  property?: SceneProperty;
  plugins?: Record<string, Plugin>;
  layers?: Layer[];
  widgets?: Widget[];
  widgetAlignSystem?: WidgetAlignSystem;
  clusters: Cluster[];
  tags?: Tag[];
  story?: Story;
};

export type Plugin = {
  id: string;
  property: unknown;
};

export type Layer = {
  id: string;
  name?: string;
  pluginId: string;
  extensionId: string;
  propertyId?: string;
  /** If undefined, it should be treated as true. */
  isVisible?: boolean;
  property: unknown;
  infobox?: {
    fields: Block[];
    property: unknown;
  } | null;
  tags?: Tag[];
  children?: Layer[];
};

export type Tag = {
  id: string;
  label: string;
  tags?: Tag[];
};

export type Block = {
  id: string;
  pluginId: string;
  extensionId: string;
  property: unknown;
};

export type Widget = {
  id: string;
  pluginId: string;
  extensionId: string;
  property: unknown;
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

export type Cluster = {
  id: string;
  name?: string;
  property: unknown;
};

export type WidgetAlignment = "start" | "centered" | "end";

export type WidgetAreaPadding = { top: number; bottom: number; left: number; right: number };

export type ClusterProperty = {
  id: string;
  default?: {
    clusterPixelRange: number;
    clusterMinSize: number;
    clusterLabelTypography?: Typography;
    clusterImage?: string;
    clusterImageHeight?: number;
    clusterImageWidth?: number;
  };
  layers?: { layer?: string }[];
};

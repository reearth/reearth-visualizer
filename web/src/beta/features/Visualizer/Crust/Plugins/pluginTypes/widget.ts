import { WidgetLayout } from "@reearth/beta/features/Visualizer/Crust/Widgets/types";

export declare type Widget<P = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
  extended?: {
    horizontally: boolean;
    vertically: boolean;
  };
  layout?: WidgetLayout;
};

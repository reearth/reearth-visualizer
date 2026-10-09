import { Layer } from "@reearth/core";

// SYNC: These inlined types must be kept in sync with the web source manually.
// No CI check enforces this — when the source changes, update here too.
//   WidgetLocation / WidgetAlignment / WidgetLayout
//     → web/src/app/features/Visualizer/Crust/Widgets/types.ts
//   PluginInfoboxBlock
//     → web/src/app/features/Visualizer/Crust/Infobox/types.ts
//       (Omit<InfoboxBlock, "propertyForPluginAPI" | "propertyItemsForPluginBlock">)
//   PluginStoryBlock
//     → web/src/app/features/Visualizer/Crust/StoryPanel/types.ts
//       (Omit<StoryBlock, "propertyForPluginAPI" | "propertyItemsForPluginBlock">)

// Inlined from web/src/app/features/Visualizer/Crust/Widgets/types.ts
export type WidgetLocation = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export type WidgetAlignment = "start" | "centered" | "end";

export type WidgetLayout = {
  location: WidgetLocation;
  align?: WidgetAlignment;
};

// Inlined from web/src/app/features/Visualizer/Crust/Infobox/types.ts (PluginInfoboxBlock)
export type PluginInfoboxBlock = {
  id: string;
  name?: string;
  pluginId?: string;
  extensionId?: string;
  extensionType?: "infoboxBlock";
  propertyId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property?: any;
};

// Inlined from web/src/app/features/Visualizer/Crust/StoryPanel/types.ts (PluginStoryBlock)
export type PluginStoryBlock = {
  id: string;
  name?: string | null;
  pluginId: string;
  extensionId: string;
  extensionType?: "storyBlock";
  propertyId?: string;
  // Inlined from StoryBlockProperty = Record<string, Record<string, any>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property?: Record<string, Record<string, any>>;
};

export declare type Extension = {
  readonly block?: PluginStoryBlock | (PluginInfoboxBlock & { layer?: Layer });
  readonly widget?: Widget;
  readonly list: PluginExtensionInstance[];
  readonly postMessage?: (id: string, message: unknown) => void;
  readonly on: ExtensionEvents["on"];
  readonly off: ExtensionEvents["off"];
};

export declare type Widget = {
  readonly id: string;
  readonly pluginId?: string;
  readonly extensionId?: string;
  readonly property?: unknown;
  readonly propertyId?: string;
  readonly extended?: {
    horizontally: boolean;
    vertically: boolean;
  };
  readonly layout?: WidgetLayout;
};

export declare type PluginExtensionInstance = {
  readonly id: string;
  readonly pluginId: string;
  readonly name: string;
  readonly extensionId: string;
  readonly extensionType: "widget" | "block" | "infoboxBlock" | "storyBlock";
  readonly runTimes: number | undefined;
};

export declare type ExtensionEventType = {
  message: [message: unknown];
  extensionMessage: [props: ExtensionMessage];
};

export declare type ExtensionEvents = {
  readonly on: <T extends keyof ExtensionEventType>(
    type: T,
    callback: (...args: ExtensionEventType[T]) => void,
    options?: { once?: boolean }
  ) => void;
  readonly off: <T extends keyof ExtensionEventType>(
    type: T,
    callback: (...args: ExtensionEventType[T]) => void
  ) => void;
};

export declare type ExtensionMessage = {
  data: unknown;
  sender: string;
};

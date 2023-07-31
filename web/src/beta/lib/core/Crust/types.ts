export type {
  Camera,
  Typography,
  LatLng,
  FlyToDestination,
  LookAtDestination,
  Clock,
  ValueTypes,
  ValueType,
  Ref as MapRef,
  SceneProperty,
} from "../Map";
export type { Theme } from "./theme";
export type { InteractionModeType } from "./interactionMode";

export type UnsafeBuiltinPlugin = {
  id: string;
  name: string;
  widgets: UnsafeBuiltinWidget[];
  blocks: UnsafeBuiltinBlock[];
};

type UnsafeBuiltinWidget = UnsafeBuiltinPluginExtension<"widget">;

type UnsafeBuiltinBlock = UnsafeBuiltinPluginExtension<"block">;

type UnsafeBuiltinPluginExtension<T extends "widget" | "block"> = {
  type: T;
  extensionId: string;
  name: string;
  component: React.FC;
};

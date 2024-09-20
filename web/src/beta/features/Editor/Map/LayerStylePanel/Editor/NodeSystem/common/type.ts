import {
  AppearanceTypes,
  Cesium3DTilesAppearance,
  MarkerAppearance,
  ModelAppearance,
  PolygonAppearance,
  PolylineAppearance
} from "@reearth/core";
import { SetStateAction } from "jotai";
import { Dispatch } from "react";

import { LayerStyleProps } from "../../InterfaceTab";

export type HeightReferenceAppearanceType =
  | MarkerAppearance
  | PolygonAppearance
  | ModelAppearance;

export type AppearanceType =
  | "marker"
  | "model"
  | "polygon"
  | "polyline"
  | "3dtiles";

export type AppearanceMap = Pick<
  AppearanceTypes,
  "marker" | "model" | "polyline" | "polygon" | "3dtiles"
>;

export type AppearanceTypeKeys =
  | keyof MarkerAppearance
  | keyof ModelAppearance
  | keyof PolygonAppearance
  | keyof PolylineAppearance
  | keyof Cesium3DTilesAppearance;

export type Condition = [string, string | boolean | number];

export type CommonIputProp = {
  appearanceType: AppearanceType;
  appearanceTypeKey: AppearanceTypeKeys;
  title?: string;
  expression: string;
  setExpression: Dispatch<SetStateAction<string>>;
  conditions: Condition[];
  setConditions: Dispatch<SetStateAction<Condition[]>>;
} & LayerStyleProps;

export type Tabs = "value" | "expression" | "condition";

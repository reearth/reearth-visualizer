import { type WidgetZone, type WidgetSection, type WidgetAlignSystem } from ".";

export const WAS_SECTIONS = ["left", "center", "right"] as (keyof WidgetZone)[];
export const WAS_AREAS = ["top", "middle", "bottom"] as (keyof WidgetSection)[];
export const WAS_ZONES = ["outer", "inner"] as (keyof WidgetAlignSystem)[];

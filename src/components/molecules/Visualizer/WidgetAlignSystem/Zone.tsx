import React, { PropsWithChildren } from "react";
import { GridSection } from "react-align";

import Area from "./Area";
import type { WidgetZone, Location, Alignment, WidgetLayoutConstraint } from "./hooks";

export type Props = {
  zone: WidgetZone;
  zoneName: "inner" | "outer";
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  onReorder?: (id: string, hoverIndex: number) => void;
  onMove?: (currentItem: string, dropLocation: Location, originalLocation?: Location) => void;
  onAlignChange?: (location: Location, align: Alignment) => void;
  onExtend?: (currentItem: string, extended: boolean) => void;
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginBaseUrl?: string;
};

const sections = ["left", "center", "right"] as const;
const areas = ["top", "middle", "bottom"] as const;

export default function Zone({
  zone,
  zoneName,
  layoutConstraint,
  sceneProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  children,
  onReorder,
  onMove,
  onAlignChange,
  onExtend,
}: PropsWithChildren<Props>) {
  return (
    <>
      {sections.map(s => (
        <GridSection key={s} stretch={s === "center"}>
          {areas.map(a =>
            s === "center" && children && a === "middle" ? (
              <div key={a} style={{ display: "flex", flex: "1 0 auto" }}>
                {children}
              </div>
            ) : (
              <Area
                key={a}
                zone={zoneName}
                section={s}
                area={a}
                widgets={zone[s][a].widgets}
                align={zone[s][a].align}
                layoutConstraint={layoutConstraint}
                onReorder={onReorder}
                onMove={onMove}
                onAlignChange={onAlignChange}
                onExtend={onExtend}
                sceneProperty={sceneProperty}
                pluginBaseUrl={pluginBaseUrl}
                isEditable={isEditable}
                isBuilt={isBuilt}
              />
            ),
          )}
        </GridSection>
      ))}
    </>
  );
}

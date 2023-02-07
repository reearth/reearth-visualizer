import { ReactNode } from "react";
import { GridSection } from "react-align";

import Area, { WidgetAreaType } from "./Area";
import type { WidgetZone, WidgetLayoutConstraint, WidgetProps } from "./types";

export type { WidgetAreaType };

export type Props = {
  children?: ReactNode;
  selectedWidgetArea?: WidgetAreaType;
  zone?: WidgetZone;
  zoneName: "inner" | "outer";
  invisibleWidgetIDs?: string[];
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  renderWidget?: (props: WidgetProps) => ReactNode;
  onWidgetAreaSelect?: (widgetArea?: WidgetAreaType) => void;
};

const sections = ["left", "center", "right"] as const;
const areas = ["top", "middle", "bottom"] as const;

export default function Zone({
  selectedWidgetArea,
  zone,
  zoneName,
  layoutConstraint,
  children,
  renderWidget,
  onWidgetAreaSelect,
}: Props) {
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
                selectedWidgetArea={selectedWidgetArea}
                zone={zoneName}
                section={s}
                area={a}
                widgets={zone?.[s]?.[a]?.widgets}
                align={zone?.[s]?.[a]?.align ?? "start"}
                padding={zone?.[s]?.[a]?.padding ?? { top: 0, bottom: 0, left: 0, right: 0 }}
                backgroundColor={zone?.[s]?.[a]?.background ?? "unset"}
                gap={zone?.[s]?.[a]?.gap ?? 0}
                centered={zone?.[s]?.[a]?.centered ?? false}
                layoutConstraint={layoutConstraint}
                renderWidget={renderWidget}
                onWidgetAreaSelect={onWidgetAreaSelect}
              />
            ),
          )}
        </GridSection>
      ))}
    </>
  );
}

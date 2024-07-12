import { ReactNode } from "react";
import { GridSection } from "react-align";

import Area, { WidgetAreaType } from "./Area";
import { WAS_SECTIONS, WAS_AREAS } from "./constants";
import type { WidgetZone, WidgetLayoutConstraint, WidgetProps } from "./types";

export type { WidgetAreaType };

export type Props = {
  children?: ReactNode;
  selectedWidgetArea?: WidgetAreaType;
  zone?: WidgetZone;
  zoneName: "inner" | "outer";
  invisibleWidgetIDs?: string[];
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  built?: boolean;
  isMobile?: boolean;
  renderWidget?: (props: WidgetProps) => ReactNode;
  onWidgetAreaSelect?: (widgetArea?: WidgetAreaType) => void;
};

export default function Zone({
  selectedWidgetArea,
  zone,
  zoneName,
  layoutConstraint,
  built,
  isMobile,
  children,
  renderWidget,
  onWidgetAreaSelect,
}: Props) {
  return (
    <>
      {WAS_SECTIONS.map(s => (
        <GridSection key={s} stretch={s === "center"}>
          {WAS_AREAS.map(a =>
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
                align={zone?.[s]?.[a]?.align}
                padding={zone?.[s]?.[a]?.padding}
                backgroundColor={zone?.[s]?.[a]?.background}
                gap={zone?.[s]?.[a]?.gap}
                centered={zone?.[s]?.[a]?.centered}
                layoutConstraint={layoutConstraint}
                built={built}
                isMobile={isMobile}
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

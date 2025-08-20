import { ReactNode } from "react";
import { GridSection } from "react-align";

import Area, { WidgetAreaType } from "./Area";
import { WAS_AREAS } from "./constants";
import type {
  WidgetZone,
  WidgetLayoutConstraint,
  Theme,
  WidgetProps
} from "./types";

export type Props = {
  children?: ReactNode;
  selectedWidgetArea?: WidgetAreaType;
  zone?: WidgetZone;
  zoneName: "inner" | "outer";
  theme?: Theme;
  built?: boolean;
  isMobile?: boolean;
  layoutConstraint?: Record<string, WidgetLayoutConstraint>;
  invisibleWidgetIDs?: string[];
  renderWidget?: (props: WidgetProps) => ReactNode;
  onWidgetAreaSelect?: (widgetArea?: WidgetAreaType) => void;
};

export default function MobileZone({
  selectedWidgetArea,
  zone,
  zoneName,
  layoutConstraint,
  built,
  isMobile,
  children,
  renderWidget,
  onWidgetAreaSelect
}: Props) {
  return (
    <GridSection stretch>
      {WAS_AREAS.map((a) =>
        children && a === "middle" ? (
          <div key={a} style={{ display: "flex", flex: "1 0 auto" }}>
            {children}
          </div>
        ) : (
          <Area
            key={a}
            selectedWidgetArea={selectedWidgetArea}
            zone={zoneName}
            section={"center"}
            area={a}
            widgets={zone?.center?.[a]?.widgets}
            align={zone?.center?.[a]?.align}
            padding={zone?.center?.[a]?.padding}
            gap={zone?.center?.[a]?.gap}
            centered={zone?.center?.[a]?.centered}
            backgroundColor={zone?.center?.[a]?.background}
            layoutConstraint={layoutConstraint}
            built={built}
            isMobile={isMobile}
            renderWidget={renderWidget}
            onWidgetAreaSelect={onWidgetAreaSelect}
          />
        )
      )}
    </GridSection>
  );
}

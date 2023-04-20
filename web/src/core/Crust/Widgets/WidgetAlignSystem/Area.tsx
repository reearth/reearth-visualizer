import { omit, pick } from "lodash-es";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { GridArea, GridItem } from "react-align";
import { useDeepCompareEffect } from "react-use";

import { useTheme } from "@reearth/theme";

import type {
  Alignment,
  WidgetAreaPadding,
  WidgetLayoutConstraint,
  Location,
  WidgetLayout,
  WidgetProps,
  InternalWidget,
} from "./types";

export type WidgetAreaType = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
  align?: Alignment;
  padding?: WidgetAreaPadding;
  widgets?: InternalWidget[];
  gap?: number;
  centered?: boolean;
  background?: string;
};

type Props = {
  selectedWidgetArea?: WidgetAreaType;
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
  align?: Alignment;
  padding?: WidgetAreaPadding;
  backgroundColor?: string;
  gap?: number;
  centered?: boolean;
  built?: boolean;
  widgets?: InternalWidget[];
  onWidgetAreaSelect?: (widgetArea?: WidgetAreaType) => void;
  // note that layoutConstraint will be always undefined in published pages
  layoutConstraint?: { [w in string]: WidgetLayoutConstraint };
  renderWidget?: (props: WidgetProps) => ReactNode;
};

export default function Area({
  selectedWidgetArea,
  zone,
  section,
  area,
  align,
  padding,
  backgroundColor,
  gap,
  centered,
  built,
  widgets,
  layoutConstraint,
  renderWidget,
  onWidgetAreaSelect,
}: Props) {
  const theme = useTheme();
  const layout = useMemo<WidgetLayout>(
    () => ({
      location: { zone, section, area },
      align,
    }),
    [align, area, section, zone],
  );
  const { overriddenExtended, handleExtend } = useOverriddenExtended({ layout, widgets });

  return !(zone === "inner" && section === "center" && area === "middle") ? (
    <GridArea
      key={area}
      onClick={() =>
        widgets?.length &&
        onWidgetAreaSelect?.({
          area,
          section,
          zone,
          background: backgroundColor,
          centered,
          gap,
          padding: {
            top: padding?.top ?? 6,
            bottom: padding?.bottom ?? 6,
            left: padding?.left ?? 6,
            right: padding?.right ?? 6,
          },
        })
      }
      id={`${zone}/${section}/${area}`}
      vertical={area === "middle"}
      stretch={area === "middle"}
      bottom={(section === "right" && area !== "top") || area === "bottom"}
      realignable={(area === "middle" || section === "center") && !!widgets?.length}
      align={
        widgets?.length
          ? area === "middle" || section === "center"
            ? align
            : section === "right"
            ? "end"
            : undefined
          : undefined
      }
      style={{
        flexWrap: "wrap",
        pointerEvents: "none",
        padding: widgets?.length
          ? `${padding?.top}px ${padding?.right}px ${padding?.bottom}px ${padding?.left}px`
          : "0",
        backgroundColor: backgroundColor,
        gap: gap,
        alignItems: centered ? "center" : "unset",
        borderRadius: 0,
        transition: built ? "none" : undefined,
      }}
      editorStyle={{
        flexWrap: "wrap",
        padding: `${padding?.top}px ${padding?.right}px ${padding?.bottom}px ${padding?.left}px`,
        background: backgroundColor
          ? backgroundColor
          : area === "middle"
          ? theme.alignSystem.blueBg
          : theme.alignSystem.orangeBg,
        border:
          `${selectedWidgetArea?.zone}/${selectedWidgetArea?.section}/${selectedWidgetArea?.area}` ===
          `${zone}/${section}/${area}`
            ? `1.2px dashed #00FFFF`
            : area === "middle"
            ? `1px solid ${theme.alignSystem.blueHighlight}`
            : `1px solid ${theme.alignSystem.orangeHighlight}`,
        gap: gap,
        alignItems: centered ? "center" : "unset",
      }}
      iconColor={area === "middle" ? "#4770FF" : "#E95518"}>
      {widgets?.map((widget, i) => {
        const constraint =
          widget.pluginId && widget.extensionId
            ? layoutConstraint?.[`${widget.pluginId}/${widget.extensionId}`]
            : undefined;
        const extended = overriddenExtended?.[widget.id];
        const extendable2 =
          (section === "center" && constraint?.extendable?.horizontally) ||
          (area === "middle" && constraint?.extendable?.vertically);
        return (
          <GridItem
            key={widget.id}
            id={widget.id}
            index={i}
            extended={extended ?? widget.extended}
            extendable={extendable2}
            style={{ pointerEvents: "none", margin: 0 }}
            editorStyle={{ margin: 0 }}>
            {({ editing }) =>
              renderWidget?.({
                widget,
                layout,
                extended,
                editing,
                onExtend: handleExtend,
              })
            }
          </GridItem>
        );
      })}
    </GridArea>
  ) : null;
}

function useOverriddenExtended({
  layout,
  widgets,
}: {
  layout: WidgetLayout;
  widgets: InternalWidget[] | undefined;
}) {
  const extendable = layout.location.section === "center" || layout.location.area === "middle";
  const [overriddenExtended, overrideExtend] = useState<{ [id in string]?: boolean }>({});
  const handleExtend = useCallback(
    (id: string, extended: boolean | undefined) => {
      overrideExtend(oe =>
        oe[id] === extended
          ? oe
          : {
              ...omit(oe, id),
              ...(typeof extended === "undefined" || !extendable ? {} : { [id]: extended }),
            },
      );
    },
    [extendable],
  );

  const widgetIds = widgets?.map(w => w.id) ?? [];
  useDeepCompareEffect(() => {
    overrideExtend(oe => pick(oe, Object.keys(widgetIds)));
  }, [widgetIds]);

  return {
    overriddenExtended: extendable ? overriddenExtended : undefined,
    handleExtend,
  };
}

export function getLocationFromId(id: string): Location | undefined {
  const [z, s, a] = id.split("/");
  return (z === "inner" || z === "outer") &&
    (s === "left" || s === "center" || s === "right") &&
    (a === "top" || a === "middle" || a === "bottom")
    ? {
        zone: z,
        section: s,
        area: a,
      }
    : undefined;
}

import { omit, pick } from "lodash-es";
import { useCallback, useMemo, useState } from "react";
import { GridArea, GridItem } from "react-align";
import { useDeepCompareEffect } from "react-use";

import { WidgetAreaState } from "@reearth/components/organisms/EarthEditor/PropertyPane/hooks";
import { useTheme } from "@reearth/theme";

import { Viewport } from "../hooks";
import type { CommonProps as PluginCommonProps } from "../Plugin";
import W, { WidgetLayout } from "../Widget";

import type {
  Widget,
  Alignment,
  WidgetAreaPadding,
  WidgetLayoutConstraint,
  Location,
} from "./hooks";

type Props = {
  selectedWidgetArea?: WidgetAreaState;
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
  isMobileZone?: boolean;
  align: Alignment;
  padding: WidgetAreaPadding;
  backgroundColor: string;
  gap: number;
  centered: boolean;
  widgets?: Widget[];
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  viewport?: Viewport;
  onWidgetAlignAreaSelect?: (widgetArea?: WidgetAreaState) => void;
  // note that layoutConstraint will be always undefined in published pages
  layoutConstraint?: { [w in string]: WidgetLayoutConstraint };
} & PluginCommonProps;

export default function Area({
  isMobileZone,
  selectedWidgetArea,
  zone,
  section,
  area,
  align,
  padding,
  backgroundColor,
  gap,
  centered,
  widgets,
  pluginProperty,
  layoutConstraint,
  onWidgetAlignAreaSelect,
  ...props
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
      id={`${zone}/${section}/${area}`}
      onClick={() =>
        onWidgetAlignAreaSelect?.({
          area,
          section,
          zone,
          background: backgroundColor,
          centered,
          gap,
          padding,
        })
      }
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
        padding: isMobileZone
          ? "inherit"
          : `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        backgroundColor: isMobileZone ? "inherit" : backgroundColor,
        gap: isMobileZone ? "inherit" : gap,
        alignItems: centered && !isMobileZone ? "center" : "inherit",
        borderRadius: 0,
      }}
      editorStyle={{
        flexWrap: "wrap",
        padding: isMobileZone
          ? "inherit"
          : `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        background:
          backgroundColor && !isMobileZone
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
        cursor: "pointer",
        gap: isMobileZone ? "inherit" : gap,
        alignItems: centered && !isMobileZone ? "center" : "inherit",
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
            style={{ pointerEvents: "none", margin: isMobileZone ? 6 : 0 }}
            editorStyle={{ margin: isMobileZone ? 6 : 0 }}>
            {({ editing }) => (
              <W
                widget={widget}
                pluginProperty={
                  widget.pluginId && widget.extensionId
                    ? pluginProperty?.[`${widget.pluginId}/${widget.extensionId}`]
                    : undefined
                }
                layout={layout}
                extended={extended}
                editing={editing}
                onExtend={handleExtend}
                {...props}
              />
            )}
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
  widgets: Widget[] | undefined;
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

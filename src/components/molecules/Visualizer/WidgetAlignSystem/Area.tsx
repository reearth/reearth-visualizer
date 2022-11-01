import { omit, pick } from "lodash-es";
import { useCallback, useMemo, useState } from "react";
import { GridArea, GridItem } from "react-align";
import { useDeepCompareEffect } from "react-use";

import { useTheme } from "@reearth/theme";

import type { CommonProps as PluginCommonProps } from "../Plugin";
import W, { WidgetLayout } from "../Widget";

import type { Widget, Alignment, WidgetLayoutConstraint, Location } from "./hooks";

type Props = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
  align: Alignment;
  widgets?: Widget[];
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  // note that layoutConstraint will be always undefined in published pages
  layoutConstraint?: { [w in string]: WidgetLayoutConstraint };
} & PluginCommonProps;

export default function Area({
  zone,
  section,
  area,
  align,
  widgets,
  pluginProperty,
  layoutConstraint,
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
      style={{ flexWrap: "wrap", pointerEvents: "none" }}
      editorStyle={{
        flexWrap: "wrap",
        background: area === "middle" ? theme.alignSystem.blueBg : theme.alignSystem.orangeBg,
        border:
          area === "middle"
            ? `1px solid ${theme.alignSystem.blueHighlight}`
            : `1px solid ${theme.alignSystem.orangeHighlight}`,
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
            style={{ pointerEvents: "none" }}>
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

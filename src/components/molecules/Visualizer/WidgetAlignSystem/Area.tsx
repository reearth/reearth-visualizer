import React, { useCallback } from "react";
import { GridArea, GridItem } from "react-align";

import { useTheme } from "@reearth/theme";

import W from "../Widget";

import type { Widget, Alignment, Location, WidgetLayoutConstraint } from "./hooks";

type Props = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
  align: Alignment;
  widgets?: (Widget | undefined)[];
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginBaseUrl?: string;
  layoutConstraint?: { [w in string]: WidgetLayoutConstraint };
  onReorder?: (id: string, hoverIndex: number) => void;
  onMove?: (currentItem: string, dropLocation: Location, originalLocation: Location) => void;
  onAlignChange?: (location: Location, align: Alignment) => void;
  onExtend?: (currentItem: string, extended: boolean) => void;
};

const nop = () => {};

export default function WidgetAreaComponent({
  zone,
  section,
  area,
  align,
  widgets,
  sceneProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  layoutConstraint,
  onReorder,
  onMove,
  onAlignChange,
  onExtend,
}: Props) {
  const theme = useTheme();

  const handleAlignChange = useCallback(
    (align: Alignment) => {
      onAlignChange?.({ zone, section, area }, align);
    },
    [area, onAlignChange, section, zone],
  );

  const handleReorder = useCallback(
    (id: string, _l: Location, _i: number, hoverIndex: number) => onReorder?.(id, hoverIndex),
    [onReorder],
  );

  return (
    <GridArea<Location>
      key={area}
      vertical={area === "middle"}
      stretch={area === "middle"}
      reverse={area !== "middle" && section === "right"}
      end={section === "right" || area === "bottom"}
      align={(area === "middle" || section === "center") && widgets?.length ? align : undefined}
      onAlignChange={handleAlignChange}
      location={{ zone: zone, section: section, area: area }}
      editorStyles={{
        background: area === "middle" ? theme.alignSystem.blueBg : theme.alignSystem.orangeBg,
        border:
          area === "middle"
            ? `1px solid ${theme.alignSystem.blueHighlight}`
            : `1px solid ${theme.alignSystem.orangeHighlight}`,
      }}
      iconColor={area === "middle" ? "#4770FF" : "#E95518"}>
      {widgets?.map((widget, i) => {
        const constraint =
          widget?.pluginId && widget.extensionId
            ? layoutConstraint?.[`${widget.pluginId}/${widget.extensionId}`]
            : undefined;
        const extendable =
          (section === "center" && constraint?.extendable?.horizontally) ||
          (area === "middle" && constraint?.extendable?.vertically);
        const loc = { zone: zone, section: section, area: area };
        return (
          <GridItem
            key={widget?.id + "container"}
            id={widget?.id as string}
            location={loc}
            index={i}
            onReorder={handleReorder}
            onMoveArea={onMove || nop}
            extended={widget?.extended}
            extendable={extendable}
            onExtend={onExtend}
            styles={{ pointerEvents: "auto" }}>
            <W
              key={widget?.id}
              widget={widget}
              sceneProperty={sceneProperty}
              pluginProperty={widget?.pluginProperty}
              isEditable={isEditable}
              isBuilt={isBuilt}
              pluginBaseUrl={pluginBaseUrl}
              widgetLayout={{
                floating: false,
                location: loc,
                align,
              }}
            />
          </GridItem>
        );
      })}
    </GridArea>
  );
}

import { useEffect, useState, useCallback } from "react";

import type {
  WidgetAlignSystem,
  InternalWidget,
  WidgetLocationOptions,
  WidgetArea,
  WidgetSection,
  WidgetZone,
} from "../Widgets";

export default ({ alignSystem }: { alignSystem: WidgetAlignSystem | undefined }) => {
  const [overriddenAlignSystem, setOverrideAlignSystem] = useState<WidgetAlignSystem | undefined>(
    alignSystem,
  );

  const moveWidget = useCallback((widgetId: string, options: WidgetLocationOptions) => {
    if (
      !["outer", "inner"].includes(options.zone) ||
      !["left", "center", "right"].includes(options.section) ||
      !["top", "middle", "bottom"].includes(options.area) ||
      (options.section === "center" && options.area === "middle")
    )
      return;

    let widget: InternalWidget | undefined;

    setOverrideAlignSystem(alignSystem => {
      if (!alignSystem) return alignSystem;
      Object.keys(alignSystem).forEach(zoneName => {
        const zone = alignSystem[zoneName as keyof WidgetAlignSystem];
        if (zone) {
          Object.keys(zone).forEach(sectionName => {
            const section = zone[sectionName as keyof WidgetZone];
            if (section) {
              Object.keys(section).forEach(areaName => {
                const area = section[areaName as keyof WidgetSection];
                if (!widget && area?.widgets) {
                  const sourceIndex = area.widgets.findIndex(w => w.id === widgetId);
                  if (sourceIndex !== -1) {
                    [widget] = area.widgets.splice(sourceIndex, 1);
                  }
                }
              });
            }
          });
        }
      });
      return { ...alignSystem };
    });

    setTimeout(() => {
      setOverrideAlignSystem(alignSystem => {
        if (!alignSystem || !widget) return alignSystem;
        if (!alignSystem[options.zone]) {
          alignSystem[options.zone] = {
            left: undefined,
            center: undefined,
            right: undefined,
          };
        }

        const targetZone = alignSystem[options.zone] as WidgetZone;
        if (!targetZone[options.section]) {
          targetZone[options.section] = {
            top: undefined,
            middle: undefined,
            bottom: undefined,
          };
        }

        const targetSection = targetZone[options.section] as WidgetSection;
        if (!targetSection[options.area]) {
          targetSection[options.area] = {
            align: "start",
            widgets: [],
          };
        }

        const targetArea = targetSection[options.area] as WidgetArea;
        if (!targetArea.widgets) targetArea.widgets = [];
        if (options.method === "insert") {
          targetArea.widgets.unshift(widget);
        } else {
          targetArea.widgets.push(widget);
        }

        return { ...alignSystem };
      });
    }, 0);
  }, []);

  useEffect(() => {
    setOverrideAlignSystem(alignSystem);
  }, [alignSystem]);

  return {
    overriddenAlignSystem,
    moveWidget,
  };
};

import { useEffect, useState, useCallback } from "react";

import type { WidgetLocationOptions } from "./Plugin/types";
import type {
  Widget,
  WidgetAlignSystem,
  WidgetSection,
  WidgetZone,
  WidgetArea,
} from "./WidgetAlignSystem";

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

    let widget: Widget | undefined;

    setOverrideAlignSystem(alignSystem => {
      if (!alignSystem) return alignSystem;
      let next = { ...alignSystem };
      Object.keys(next).forEach(zoneName_ => {
        const zoneName = zoneName_ as keyof WidgetAlignSystem;
        const zone = alignSystem[zoneName];
        if (zone) {
          Object.keys(zone).forEach(sectionName_ => {
            const sectionName = sectionName_ as keyof WidgetZone;
            const section = zone[sectionName];
            if (section) {
              Object.keys(section).forEach(areaName_ => {
                const areaName = areaName_ as keyof WidgetSection;
                const area = section[areaName];
                if (!widget && area?.widgets) {
                  const sourceIndex = area.widgets.findIndex(w => w.id === widgetId);
                  if (sourceIndex !== -1) {
                    [widget] = area.widgets.splice(sourceIndex, 1);
                    next = {
                      ...next,
                      [zoneName]: {
                        ...next[zoneName],
                        [sectionName]: {
                          ...(next[zoneName]?.[sectionName] || {}),
                          [areaName]: {
                            ...(next[zoneName]?.[sectionName]?.[areaName] || {}),
                            ...area,
                          },
                        },
                      },
                    };
                  }
                }
              });
            }
          });
        }
      });
      return { ...next };
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

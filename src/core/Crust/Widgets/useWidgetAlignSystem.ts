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

  // NOTE: This is invisible list of widget.
  //       The reason why we use invisible list is prevent initializing cost.
  const [invisibleWidgetIDs, setInvisibleWidgetIDs] = useState<string[]>([]);

  const onVisibilityChange = useCallback((widgetId: string, v: boolean) => {
    setInvisibleWidgetIDs(a => {
      if (!a.includes(widgetId) && !v) {
        return [...a, widgetId];
      }
      if (a.includes(widgetId) && v) {
        return a.filter(i => i !== widgetId);
      }
      return a;
    });
  }, []);

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
      Object.keys(alignSystem).forEach(zoneName_ => {
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

        if (targetArea.widgets.length) {
          const next = {
            ...alignSystem,
            [options.zone]: {
              ...alignSystem[options.zone],
              [options.section]: {
                ...(alignSystem[options.zone]?.[options.section] || {}),
                [options.area]: {
                  ...(alignSystem[options.zone]?.[options.section]?.[options.area] || {}),
                  widgets: [...targetArea.widgets],
                },
              },
            },
          };
          return { ...next };
        }

        return alignSystem;
      });
    }, 0);
  }, []);

  useEffect(() => {
    setOverrideAlignSystem(alignSystem);
  }, [alignSystem]);

  return {
    overriddenAlignSystem,
    moveWidget,
    invisibleWidgetIDs,
    onVisibilityChange,
  };
};

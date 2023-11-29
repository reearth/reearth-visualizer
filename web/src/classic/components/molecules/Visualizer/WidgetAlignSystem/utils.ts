import { isBuiltinWidget } from "../Widget/builtin";

import { Widget, WidgetZone } from "./hooks";

const sections = ["left", "center", "right"] as const;
const areas = ["top", "middle", "bottom"] as const;

export const filterSections = (
  zone?: WidgetZone,
  invisibleWidgetIDs?: string[],
  cb?: (s: (typeof sections)[number]) => void,
) => {
  return sections.filter(
    s =>
      areas.filter(a => zone?.[s]?.[a]?.widgets?.some(w => !invisibleWidgetIDs?.includes(w.id)))
        .length || cb?.(s),
  );
};

export const isInvisibleBuiltin = (widget: Widget, isMobile?: boolean) => {
  const defaultVisible = widget.property?.default?.visible;
  return (
    isBuiltinWidget(`${widget.pluginId}/${widget.extensionId}`) &&
    !(
      !defaultVisible ||
      defaultVisible === "always" ||
      (defaultVisible === "desktop" && !isMobile) ||
      (defaultVisible === "mobile" && !!isMobile)
    )
  );
};

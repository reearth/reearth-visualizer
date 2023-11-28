import { isBuiltinWidget } from "../Widget/builtin";

import { InternalWidget, WidgetZone } from "./types";

const sections = ["left", "center", "right"] as const;
const areas = ["top", "middle", "bottom"] as const;

export const filterSections = (
  zone?: WidgetZone,
  invisibleWidgetIDs?: string[],
  cb?: (s: (typeof sections)[number]) => void,
) => {
  return sections.filter(
    s =>
      areas.filter(a => zone?.[s]?.[a]?.widgets?.find(w => !invisibleWidgetIDs?.includes(w.id)))
        .length > 0 || cb?.(s),
  );
};

export const isBuiltInVisible = (widget: InternalWidget, isMobile?: boolean) => {
  const defaultVisible = widget.property?.default?.visible;
  return (
    isBuiltinWidget(`${widget.pluginId}/${widget.extensionId}`) &&
    (!defaultVisible ||
      defaultVisible === "always" ||
      (defaultVisible === "desktop" && !isMobile) ||
      (defaultVisible === "mobile" && !!isMobile))
  );
};

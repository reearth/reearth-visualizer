import { isBuiltinWidget } from "../Widget/builtin";

import { WAS_SECTIONS, WAS_AREAS } from "./constants";
import { Widget, WidgetZone } from "./hooks";

export const filterSections = (
  zone?: WidgetZone,
  invisibleWidgetIDs?: string[],
  cb?: (s: (typeof WAS_SECTIONS)[number]) => void,
) => {
  return WAS_SECTIONS.filter(
    s =>
      WAS_AREAS.filter(a => zone?.[s]?.[a]?.widgets?.some(w => !invisibleWidgetIDs?.includes(w.id)))
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

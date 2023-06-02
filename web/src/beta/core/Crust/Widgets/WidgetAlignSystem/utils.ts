import { WidgetZone } from "./types";

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
        .length || cb?.(s),
  );
};

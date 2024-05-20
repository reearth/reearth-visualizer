import { useMemo } from "react";

import { BuiltinWidgets } from "./Crust";
import { getBuiltinWidgetOptions } from "./Crust/Widgets/Widget";

export default function useHooks({
  ownBuiltinWidgets,
}: {
  ownBuiltinWidgets?: (keyof BuiltinWidgets)[];
}) {
  // shouldRender
  const shouldRender = useMemo(() => {
    const shouldWidgetAnimate = ownBuiltinWidgets?.some(
      id => !!getBuiltinWidgetOptions(id).animation,
    );
    return shouldWidgetAnimate;
  }, [ownBuiltinWidgets]);

  return {
    shouldRender,
  };
}

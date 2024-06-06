import { useMemo } from "react";

import { ViewerProperty } from "@reearth/core";

import { BuiltinWidgets } from "./Crust";
import { getBuiltinWidgetOptions } from "./Crust/Widgets/Widget";
import { useOverriddenProperty } from "./utils";

export default function useHooks({
  ownBuiltinWidgets,
  viewerProperty,
}: {
  ownBuiltinWidgets?: (keyof BuiltinWidgets)[];
  viewerProperty?: ViewerProperty;
}) {
  // shouldRender
  const shouldRender = useMemo(() => {
    const shouldWidgetAnimate = ownBuiltinWidgets?.some(
      id => !!getBuiltinWidgetOptions(id).animation,
    );
    return shouldWidgetAnimate;
  }, [ownBuiltinWidgets]);

  const [overriddenViewerProperty, overrideViewerProperty] = useOverriddenProperty(viewerProperty);

  return {
    shouldRender,
    overriddenViewerProperty,
    overrideViewerProperty,
  };
}

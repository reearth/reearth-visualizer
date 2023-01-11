import { ReactNode, RefObject, useCallback } from "react";

import { Block } from "./Infobox";
import { MapRef } from "./types";
import { WidgetProps } from "./Widgets";

export default function useHook({ mapRef: _mapRef }: { mapRef?: RefObject<MapRef> }) {
  // TODO: implement plugins
  const renderWidget = useCallback((_props: WidgetProps): ReactNode => null, []);
  const renderBlock = useCallback((_block: Block): ReactNode => null, []);

  return {
    renderWidget,
    renderBlock,
  };
}

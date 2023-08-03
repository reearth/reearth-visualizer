import { useCallback } from "react";

import { useWidgetsFetcher } from "@reearth/services/api";
import type { WidgetAreaState } from "@reearth/services/state";

export default ({ sceneId }: { sceneId: string }) => {
  const { useUpdateWidgetAlignSystem } = useWidgetsFetcher();
  const handleAreaStateChange = useCallback(
    async (widgetAreaState?: WidgetAreaState) => {
      if (!sceneId || !widgetAreaState) return;
      await useUpdateWidgetAlignSystem(widgetAreaState, sceneId);
    },
    [sceneId, useUpdateWidgetAlignSystem],
  );

  return {
    handleAreaStateChange,
  };
};

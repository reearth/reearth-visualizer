import { useCallback } from "react";

import { useWidgetsFetcher } from "@reearth/services/api";
import { type WidgetAreaState, selectedWidgetAreaVar } from "@reearth/services/state";

export default ({ sceneId }: { sceneId: string }) => {
  const { useUpdateWidgetAlignSystem } = useWidgetsFetcher();
  const handleAreaStateChange = useCallback(
    async (widgetAreaState?: WidgetAreaState) => {
      if (!sceneId || !widgetAreaState) return;
      const results = await useUpdateWidgetAlignSystem(widgetAreaState, sceneId);
      if (results.status === "success") {
        selectedWidgetAreaVar(widgetAreaState);
      }
    },
    [sceneId, useUpdateWidgetAlignSystem],
  );

  return {
    handleAreaStateChange,
  };
};

import { useWidgetMutations } from "@reearth/services/api/widget";
import { WidgetAreaState } from "@reearth/services/state";
import { SetStateAction, useCallback } from "react";

type Props = {
  sceneId?: string;
  selectWidgetArea: (
    update?: SetStateAction<WidgetAreaState | undefined>
  ) => void;
};

export default ({ sceneId, selectWidgetArea }: Props) => {
  const { updateWidgetAlignSystem } = useWidgetMutations();

  const handleWidgetAreaStateChange = useCallback(
    async (widgetAreaState?: WidgetAreaState) => {
      if (!sceneId || !widgetAreaState) return;
      const results = await updateWidgetAlignSystem(widgetAreaState, sceneId);
      if (results.status === "success") {
        selectWidgetArea(widgetAreaState);
      }
    },
    [sceneId, updateWidgetAlignSystem, selectWidgetArea]
  );

  return {
    handleWidgetAreaStateChange
  };
};

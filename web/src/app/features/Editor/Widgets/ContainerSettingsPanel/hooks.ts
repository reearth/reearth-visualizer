import { useWidgetsFetcher } from "@reearth/services/api";
import { WidgetAreaState } from "@reearth/services/state";
import { SetStateAction, useCallback } from "react";

type Props = {
  sceneId?: string;
  selectWidgetArea: (
    update?: SetStateAction<WidgetAreaState | undefined>
  ) => void;
};

export default ({ sceneId, selectWidgetArea }: Props) => {
  const { useUpdateWidgetAlignSystem } = useWidgetsFetcher();

  const handleWidgetAreaStateChange = useCallback(
    async (widgetAreaState?: WidgetAreaState) => {
      if (!sceneId || !widgetAreaState) return;
      const results = await useUpdateWidgetAlignSystem(
        widgetAreaState,
        sceneId
      );
      if (results.status === "success") {
        selectWidgetArea(widgetAreaState);
      }
    },
    [sceneId, useUpdateWidgetAlignSystem, selectWidgetArea]
  );

  return {
    handleWidgetAreaStateChange
  };
};

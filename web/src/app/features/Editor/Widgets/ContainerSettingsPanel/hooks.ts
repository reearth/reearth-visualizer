import { toWidgetAlignSystemType } from "@reearth/app/utils/value";
import { useWidgetsFetcher } from "@reearth/services/api";
import { WidgetAreaState } from "@reearth/services/state";
import { SetStateAction, useCallback } from "react";

import { useWidgetsViewDevice } from "../../atoms";

type Props = {
  sceneId?: string;
  selectWidgetArea: (
    update?: SetStateAction<WidgetAreaState | undefined>
  ) => void;
};

export default ({ sceneId, selectWidgetArea }: Props) => {
  const { useUpdateWidgetAlignSystem } = useWidgetsFetcher();
  const [widgetsViewDevice] = useWidgetsViewDevice();

  const handleWidgetAreaStateChange = useCallback(
    async (widgetAreaState?: WidgetAreaState) => {
      if (!sceneId || !widgetAreaState) return;
      const type = toWidgetAlignSystemType(widgetsViewDevice);
      const results = await useUpdateWidgetAlignSystem(
        widgetAreaState,
        sceneId,
        type
      );
      if (results.status === "success") {
        selectWidgetArea(widgetAreaState);
      }
    },
    [sceneId, useUpdateWidgetAlignSystem, selectWidgetArea, widgetsViewDevice]
  );

  return {
    handleWidgetAreaStateChange
  };
};

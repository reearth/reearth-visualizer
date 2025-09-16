import { toWidgetAlignSystemType } from "@reearth/app/utils/value";
import { useWidgetMutations } from "@reearth/services/api/widget";
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
  const { updateWidgetAlignSystem } = useWidgetMutations();
  const [widgetsViewDevice] = useWidgetsViewDevice();

  const handleWidgetAreaStateChange = useCallback(
    async (widgetAreaState?: WidgetAreaState) => {
      if (!sceneId || !widgetAreaState) return;
      const type = toWidgetAlignSystemType(widgetsViewDevice);
      const results = await updateWidgetAlignSystem(
        widgetAreaState,
        sceneId,
        type
      );
      if (results.status === "success") {
        selectWidgetArea(widgetAreaState);
      }
    },
    [sceneId, updateWidgetAlignSystem, selectWidgetArea, widgetsViewDevice]
  );

  return {
    handleWidgetAreaStateChange
  };
};

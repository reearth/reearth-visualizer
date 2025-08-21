import { filterVisibleItems } from "@reearth/app/ui/fields/utils";
import { useWidgetsFetcher } from "@reearth/services/api";
import { useMemo } from "react";

import { useWidgetsViewDevice } from "../../atoms";
import { SelectedWidget } from "../../hooks/useWidgets";

type Props = {
  sceneId?: string;
  selectedWidget: SelectedWidget | undefined;
};

export default ({ sceneId, selectedWidget }: Props) => {
  const { useInstalledWidgets } = useWidgetsFetcher();

  const [widgetsViewDevice] = useWidgetsViewDevice();
  const { installedWidgets } = useInstalledWidgets({
    sceneId,
    type: widgetsViewDevice
  });

  const visibleItems = useMemo(
    () =>
      filterVisibleItems(
        installedWidgets?.find((w) => w.id === selectedWidget?.id)?.property
          .items
      ),
    [installedWidgets, selectedWidget]
  );

  return {
    visibleItems
  };
};

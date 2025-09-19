import { filterVisibleItems } from "@reearth/app/ui/fields/utils";
import { useInstalledWidgets } from "@reearth/services/api/widget";
import { useMemo } from "react";

import { SelectedWidget } from "../../hooks/useWidgets";

type Props = {
  sceneId?: string;
  selectedWidget: SelectedWidget | undefined;
};

export default ({ sceneId, selectedWidget }: Props) => {
  const { installedWidgets } = useInstalledWidgets({ sceneId });

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

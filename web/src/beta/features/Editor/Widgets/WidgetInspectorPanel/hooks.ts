import { useMemo } from "react";

import { useWidgetsFetcher } from "@reearth/services/api";

import { SelectedWidget } from "../../hooks/useWidgets";

type Props = {
  sceneId?: string;
  selectedWidget: SelectedWidget | undefined;
};

export default ({ sceneId, selectedWidget }: Props) => {
  const { useInstalledWidgetsQuery } = useWidgetsFetcher();

  const { installedWidgets } = useInstalledWidgetsQuery({ sceneId });

  const propertyItems = useMemo(
    () => installedWidgets?.find(w => w.id === selectedWidget?.id)?.property.items,
    [installedWidgets, selectedWidget],
  );

  return {
    propertyItems,
  };
};

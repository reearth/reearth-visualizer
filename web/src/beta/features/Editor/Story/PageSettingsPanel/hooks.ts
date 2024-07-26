import { useState, useEffect, useMemo, useCallback } from "react";

import { filterVisibleItems } from "@reearth/beta/components/fields/utils";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { Page } from "@reearth/services/api/storytellingApi/utils";

type SettingProps = {
  onPageUpdate?: (id: string, layers: string[]) => void;
  layers?: NLSLayer[];
  selectedPage?: Page;
};

export default ({ layers, selectedPage, onPageUpdate }: SettingProps) => {
  const pageId = useMemo(() => selectedPage?.id, [selectedPage?.id]);

  const selectedLayerIds = useMemo(() => selectedPage?.layersIds || [], [selectedPage]);

  const allLayersSelected = useMemo(() => {
    const allLayerIds = layers?.map(layer => layer.id) || [];
    return selectedLayerIds.length >= allLayerIds.length;
  }, [layers, selectedLayerIds.length]);

  const [allCheckedLayers, setAllCheckedLayers] = useState(false);

  useEffect(() => {
    setAllCheckedLayers(allLayersSelected);
  }, [selectedLayerIds, allLayersSelected]);

  const handleLayerCheck = useCallback(
    (layerId: string) => {
      if (!pageId) return;
      const updatedLayers = selectedLayerIds.includes(layerId)
        ? selectedLayerIds.filter(id => id !== layerId)
        : [...selectedLayerIds, layerId];

      onPageUpdate?.(pageId, updatedLayers);
    },
    [onPageUpdate, pageId, selectedLayerIds],
  );

  const handleAllLayersCheck = useCallback(() => {
    if (!pageId) return;
    const updatedCheckedLayers = allCheckedLayers ? [] : layers?.map(layer => layer.id) || [];
    setAllCheckedLayers(!allCheckedLayers);
    onPageUpdate?.(pageId, updatedCheckedLayers);
  }, [allCheckedLayers, layers, onPageUpdate, pageId]);

  const visibleItems = useMemo(
    () =>
      filterVisibleItems(
        selectedPage?.property.items?.filter(
          p => p.schemaGroup !== "panel" && p.schemaGroup !== "title",
        ),
      ),
    [selectedPage?.property],
  );

  return {
    checkedLayers: selectedLayerIds,
    allCheckedLayers,
    visibleItems,
    handleLayerCheck,
    handleAllLayersCheck,
  };
};

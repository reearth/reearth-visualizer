import { filterVisibleItems } from "@reearth/app/ui/fields/utils";
import type { NLSLayer } from "@reearth/services/api/layer";
import type { Page } from "@reearth/services/api/storytelling";
import { useState, useEffect, useMemo, useCallback } from "react";

type SettingProps = {
  onPageUpdate?: (id: string, layers: string[]) => void;
  layers?: NLSLayer[];
  selectedPage?: Page;
};

export default ({ layers, selectedPage, onPageUpdate }: SettingProps) => {
  const pageId = useMemo(() => selectedPage?.id, [selectedPage?.id]);

  const selectedLayerIds = useMemo(
    () => selectedPage?.layersIds || [],
    [selectedPage]
  );

  const allLayersSelected = useMemo(() => {
    const allLayerIds = layers?.map((layer) => layer.id) || [];
    return selectedLayerIds.length >= allLayerIds.length;
  }, [layers, selectedLayerIds.length]);

  const [allCheckedLayers, setAllCheckedLayers] = useState(false);
  const [checkedLayers, setCheckedLayers] = useState<string[]>([]);

  useEffect(() => {
    setAllCheckedLayers(allLayersSelected);
    setCheckedLayers(selectedLayerIds);
  }, [selectedLayerIds, allLayersSelected]);

  const handleLayerCheck = useCallback(
    (layerId: string) => {
      if (!pageId) return;
      const updatedLayers = checkedLayers.includes(layerId)
        ? checkedLayers.filter((id) => id !== layerId)
        : [...checkedLayers, layerId];

      setCheckedLayers(updatedLayers);
      onPageUpdate?.(pageId, updatedLayers);
    },
    [checkedLayers, onPageUpdate, pageId]
  );

  const handleAllLayersCheck = useCallback(() => {
    if (!pageId) return;
    const updatedCheckedLayers = allCheckedLayers
      ? []
      : layers?.map((layer) => layer.id) || [];
    setAllCheckedLayers(!allCheckedLayers);
    setCheckedLayers(updatedCheckedLayers);
    onPageUpdate?.(pageId, updatedCheckedLayers);
  }, [allCheckedLayers, layers, onPageUpdate, pageId]);

  const visibleItems = useMemo(
    () =>
      filterVisibleItems(
        selectedPage?.property.items?.filter(
          (p) => p.schemaGroup !== "panel" && p.schemaGroup !== "title"
        )
      ),
    [selectedPage?.property]
  );

  return {
    checkedLayers,
    allCheckedLayers,
    visibleItems,
    handleLayerCheck,
    handleAllLayersCheck
  };
};

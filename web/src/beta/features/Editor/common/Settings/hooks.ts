import { useState, useEffect, useMemo, useCallback } from "react";

import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { Page } from "@reearth/services/api/storytellingApi/utils";

type SettingProps = {
  onPageUpdate?: (id: string, layers: string[]) => void;
  layers?: NLSLayer[];
  selectedPage?: Page;
};
export default ({ layers, selectedPage, onPageUpdate }: SettingProps) => {
  const pageId = useMemo(() => {
    return selectedPage?.id;
  }, [selectedPage?.id]);

  const selectedLayerIds = useMemo(() => {
    return selectedPage?.layersIds || [];
  }, [selectedPage]);

  const allLayersSelected = useMemo(() => {
    const allLayerIds = layers?.map(layer => layer.id) || [];
    return selectedLayerIds.length >= allLayerIds.length;
  }, [layers, selectedLayerIds.length]);

  const [checkedLayers, setCheckedLayer] = useState<string[]>(selectedLayerIds);
  const [allCheckedLayers, setAllCheckedLayers] = useState(allLayersSelected);

  useEffect(() => {
    setCheckedLayer(selectedLayerIds);
    setAllCheckedLayers(allLayersSelected);
  }, [selectedLayerIds, allLayersSelected]);

  const handleLayerCheck = useCallback(
    (layerId: string) => {
      if (!pageId) return;
      setCheckedLayer(prev => {
        const updatedLayers = prev.includes(layerId)
          ? prev.filter(id => id !== layerId)
          : [...prev, layerId];

        onPageUpdate?.(pageId, updatedLayers);
        return updatedLayers ? updatedLayers : prev;
      });
    },
    [onPageUpdate, pageId],
  );

  const handleAllLayersCheck = useCallback(() => {
    if (!pageId) return;
    const updatedCheckedLayers = allCheckedLayers ? [] : layers?.map(layer => layer.id) || [];
    setCheckedLayer(updatedCheckedLayers);
    setAllCheckedLayers(!allCheckedLayers);
    onPageUpdate?.(pageId, updatedCheckedLayers);
  }, [allCheckedLayers, layers, onPageUpdate, pageId]);

  return {
    checkedLayers,
    allCheckedLayers,
    handleLayerCheck,
    handleAllLayersCheck,
  };
};

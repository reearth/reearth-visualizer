import { useState, useEffect, useMemo } from "react";

import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { Page } from "@reearth/services/api/storytellingApi/utils";

type SettingProps = {
  onPageUpdate?: (id: string, layers: string[]) => void;
  layers?: NLSLayer[];
  selectedPage?: Page;
};
export default ({ layers, selectedPage, onPageUpdate }: SettingProps) => {
  const pageId = selectedPage?.id;

  const allLayerIds = useMemo(() => {
    return layers?.map(layer => layer.id) || [];
  }, [layers]);

  const selectedLayerIds = useMemo(() => {
    return selectedPage?.layersIds || [];
  }, [selectedPage]);

  const allLayersSelected = useMemo(() => {
    return selectedLayerIds.length === allLayerIds.length;
  }, [selectedLayerIds, allLayerIds]);

  const [checkedLayers, setCheckedLayer] = useState<string[]>(selectedLayerIds);
  const [allCheckedLayers, setAllCheckedLayers] = useState(allLayersSelected);

  useEffect(() => {
    setCheckedLayer(selectedLayerIds);
    setAllCheckedLayers(allLayersSelected);
  }, [selectedLayerIds, allLayersSelected]);

  const handleLayerCheck = (layerId: string) => {
    if (!pageId) return;
    setCheckedLayer(prev => {
      const updatedLayers = prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId];

      onPageUpdate?.(pageId, updatedLayers);
      return updatedLayers ? updatedLayers : prev;
    });
  };

  const handleAllLayersCheck = () => {
    if (!pageId) return;
    const updatedCheckedLayers = allCheckedLayers ? [] : layers?.map(layer => layer.id) || [];
    setCheckedLayer(updatedCheckedLayers);
    setAllCheckedLayers(!allCheckedLayers);
    onPageUpdate?.(pageId, updatedCheckedLayers);
  };

  return {
    checkedLayers,
    allCheckedLayers,
    handleLayerCheck,
    handleAllLayersCheck,
  };
};

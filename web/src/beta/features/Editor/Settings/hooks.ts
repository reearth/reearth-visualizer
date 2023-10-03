import { useState, useEffect } from "react";

import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { Page } from "@reearth/services/api/storytellingApi/utils";

type SettingProps = {
  onPageUpdate?: (id: string, layers: string[]) => void;
  layers?: NLSLayer[];
  selectedPage?: Page;
};
export default ({ layers, selectedPage, onPageUpdate }: SettingProps) => {
  const [layerChecked, setLayerChecked] = useState<string[]>([]);
  const [allLayersChecked, setAllLayersChecked] = useState(false);

  useEffect(() => {
    if (selectedPage && layers) {
      const selectedLayerIds = selectedPage.layersIds || [];
      setLayerChecked(selectedLayerIds);
    }
  }, [selectedPage, layers]);

  useEffect(() => {
    if (selectedPage && layers) {
      const allLayerIds = layers.map(layer => layer.id);
      const allLayersSelected =
        layerChecked.length === allLayerIds.length &&
        layerChecked.every(layerId => allLayerIds.includes(layerId));
      setAllLayersChecked(allLayersSelected);
    }
  }, [selectedPage, layers, layerChecked]);

  const pageId = selectedPage?.id;
  const handleLayerCheck = (layerId: string) => {
    if (!pageId) return;
    setLayerChecked(prev => {
      const updatedLayers = prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId];

      onPageUpdate?.(pageId, updatedLayers);
      if (layers) {
        const allLayersSelected = layers.every(layer => updatedLayers.includes(layer.id));
        setAllLayersChecked(allLayersSelected);
      }
      return updatedLayers ? updatedLayers : prev;
    });
  };

  const handleAllLayersCheck = () => {
    if (!pageId || !layers) return;
    if (allLayersChecked) {
      setLayerChecked([]);
    } else {
      const allLayerIds = layers.map(layer => layer.id);
      setLayerChecked(allLayerIds);
    }
    onPageUpdate?.(pageId, allLayersChecked ? [] : layers.map(layer => layer.id));
    setAllLayersChecked(prev => !prev);
  };

  return {
    layerChecked,
    allLayersChecked,
    handleLayerCheck,
    handleAllLayersCheck,
  };
};

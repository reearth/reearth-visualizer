import { useState, KeyboardEvent } from "react";

export default () => {
  const [urlValue, setUrlValue] = useState("");
  const [layerValue, setLayerValue] = useState("");
  const [layers, setLayers] = useState<string[]>([]);
  const [layerInput, setLayerInput] = useState(false);

  const handleAddLayer = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const exist = layers.some((layer: string) => layer === layerValue);
      if (!exist && layerValue.trim() !== "") setLayers(prev => [...prev, layerValue]);
      setLayerValue("");
      setLayerInput(false);
    }
  };

  const handleDeleteLayer = (idx: number) => {
    const updatedLayers = [...layers];
    updatedLayers.splice(idx, 1);
    setLayers(updatedLayers);
  };

  const handleLayerInput = () => {
    setLayerInput(true);
  };

  return {
    urlValue,
    layerInput,
    layerValue,
    layers,
    setLayerValue,
    setUrlValue,
    handleAddLayer,
    handleLayerInput,
    handleDeleteLayer,
  };
};

import { useState, KeyboardEvent } from "react";

export default () => {
  const [urlValue, setUrlValue] = useState("");
  const [layerValue, setLayerValue] = useState("");
  const [layers, setLayers] = useState<string[]>([]);
  const [layerInput, setLayerInput] = useState(false);

  const handleonAddLayer = () => {
    if (layerValue.trim() !== "") {
      const exist = layers.some((layer: string) => layer === layerValue);
      if (!exist) setLayers(prev => [...prev, layerValue]);
      setLayerValue("");
    }
  };

  const handleLayerInput = () => {
    handleonAddLayer();
    setLayerInput(true);
  };

  const handleAddLayer = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleonAddLayer();
      setLayerInput(false);
    }
  };

  const handleDeleteLayer = (idx: number) => {
    const updatedLayers = [...layers];
    updatedLayers.splice(idx, 1);
    setLayers(updatedLayers);
  };

  return {
    urlValue,
    layerInput,
    layerValue,
    layers,
    setLayers,
    setLayerValue,
    setUrlValue,
    handleAddLayer,
    handleLayerInput,
    handleDeleteLayer,
  };
};

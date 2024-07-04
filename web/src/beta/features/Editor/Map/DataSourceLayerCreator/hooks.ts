import { useCallback, useState } from "react";

export default () => {
  const [mvtUrlValue, setMvtUrlValue] = useState("");
  const [wmsUrlValue, setWmsUrlValue] = useState("");

  const [isLayerName, setIsLayerName] = useState(false);
  const [layerNameValue, setLayerNameValue] = useState("");
  const [layers, setLayers] = useState<string[]>([]);

  const handleLayerNameAdd = () => {
    if (layerNameValue.trim() !== "") {
      const exist = layers.some((layer: string) => layer === layerNameValue);
      if (!exist) setLayers(prev => [...prev, layerNameValue]);
      setLayerNameValue("");
    }
  };

  const handleOnBlur = () => {
    handleLayerNameAdd();
    setIsLayerName(true);
  };

  const handleLayerNameButtonClick = () => {
    handleLayerNameAdd();
    setIsLayerName(true);
  };

  const handleLayerNameDelete = (idx: number) => {
    const updatedLayers = [...layers];
    updatedLayers.splice(idx, 1);
    setLayers(updatedLayers);
  };

  const handleOnChange = useCallback((value: string, name?: string) => {
    if (name === "mvtUrl") {
      setMvtUrlValue(value);
    } else if (name === "wmsUrl") {
      setWmsUrlValue(value);
    }
  }, []);

  return {
    mvtUrlValue,
    wmsUrlValue,
    isLayerName,
    layerNameValue,
    layers,
    setLayers,
    setLayerNameValue,
    handleOnChange,
    handleOnBlur,
    handleLayerNameDelete,
    handleLayerNameButtonClick,
    handleLayerNameAdd,
  };
};

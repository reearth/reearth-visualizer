import { useCallback, useMemo, useState } from "react";

// State of the layer names MVT and WMS data need, shared by the URL and asset
// creators.
export const useLayerNames = () => {
  const [isLayerName, setIsLayerName] = useState(false);
  const [layerName, setLayerName] = useState("");
  const [layerNameList, setLayerNameList] = useState<string[]>([]);

  const handleLayerNameAdd = useCallback(() => {
    const name = layerName.trim();
    if (!name) return;
    setLayerNameList((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setLayerName("");
  }, [layerName]);

  const handleBlur = useCallback(() => {
    handleLayerNameAdd();
    setIsLayerName(false);
  }, [handleLayerNameAdd]);

  const handleLayerNameButtonClick = useCallback(() => {
    handleLayerNameAdd();
    setIsLayerName(true);
  }, [handleLayerNameAdd]);

  const handleLayerNameDelete = useCallback((idx: number) => {
    setLayerNameList((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const reset = useCallback(() => {
    setIsLayerName(false);
    setLayerName("");
    setLayerNameList([]);
  }, []);

  // Includes a name still being typed so it isn't dropped on a direct Add.
  const entered = useMemo(
    () => [...new Set([...layerNameList, layerName.trim()])].filter(Boolean),
    [layerNameList, layerName]
  );

  return {
    entered,
    reset,
    inputProps: {
      layerNameList,
      layerName,
      isLayerName,
      onLayerNameChange: setLayerName,
      onBlur: handleBlur,
      onAddClick: handleLayerNameButtonClick,
      onDelete: handleLayerNameDelete
    }
  };
};

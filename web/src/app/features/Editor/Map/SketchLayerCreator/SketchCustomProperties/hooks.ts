import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  CustomPropertyProps,
  PropertyListProp
} from "../../SketchLayerCreator/type";

const forbiddenKeywords = new Set([
  "id",
  "type",
  "extrudedHeight",
  "positions"
]);

export default function useHooks({
  customProperties,
  propertiesList,
  setPropertiesList,
  setCustomProperties,
  setWarning
}: CustomPropertyProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [editTitleIndex, setEditTitleIndex] = useState<number | null>(null);
  const [editTypeIndex, setEditTypeIndex] = useState<number | null>(null);

  const handleTitleBlur = useCallback(
    (idx: number) => (newKeyValue?: string) => {
      if (!propertiesList) return;
      const newList = propertiesList.map((i) => ({ ...i }) as PropertyListProp);
      newList[idx].key = newKeyValue?.trim() ?? "";
      setPropertiesList?.(newList);

      const keyAlreadyExists = propertiesList.some(
        (item, index) => index !== idx && item.key === newKeyValue?.trim()
      );
      const hasForbiddenKey = newList.some((item) =>
        forbiddenKeywords.has(item.key)
      );
      if (hasForbiddenKey || keyAlreadyExists) {
        setWarning?.(true);
      } else {
        setWarning?.(false);
      }
      if (editTitleIndex === idx) setEditTitleIndex(null);
    },
    [editTitleIndex, propertiesList, setPropertiesList, setWarning]
  );

  const handleTypeChange = useCallback(
    (idx: number) => (value?: string | string[]) => {
      if (!propertiesList) return;
      const newList = propertiesList?.map(
        (i) => ({ ...i }) as PropertyListProp
      );
      newList[idx].value = (value as string) ?? "";
      setPropertiesList?.(newList);
      if (editTypeIndex === idx) setEditTypeIndex(null);
    },
    [editTypeIndex, propertiesList, setPropertiesList]
  );

  const handleDoubleClick = useCallback((idx: number, field: string) => {
    if (field === "name") {
      setEditTitleIndex(idx);
      setEditTypeIndex(null);
    } else if (field === "type") {
      setEditTypeIndex(idx);
      setEditTitleIndex(null);
    }
  }, []);

  const handleCustomPropertyAdd = useCallback(() => {
    if (!propertiesList) return;
    const newPropertiesList = [
      ...propertiesList,
      {
        id: uuidv4(),
        key: "",
        value: ""
      }
    ];
    setPropertiesList?.(newPropertiesList);
  }, [propertiesList, setPropertiesList]);

  const handleCustomPropertyDelete = useCallback(
    (idx: number) => {
      if (!customProperties || !propertiesList) return;
      const updatedPropertiesList = [...propertiesList];
      updatedPropertiesList.splice(idx, 1);
      setPropertiesList?.(updatedPropertiesList);
    },
    [customProperties, propertiesList, setPropertiesList]
  );

  const handlePropertyDrop = useCallback(
    (item: PropertyListProp, targetIndex: number) => {
      if (
        !propertiesList ||
        targetIndex < 0 ||
        targetIndex >= propertiesList.length
      )
        return;

      const newList = [...propertiesList];
      const currentIndex = newList.findIndex((li) => li.id === item.id);
      if (currentIndex === -1) return; // Item not found

      // Remove the item from its current position
      const [draggedItem] = newList.splice(currentIndex, 1);

      // Insert the item at the target index
      newList.splice(targetIndex, 0, draggedItem);

      setPropertiesList?.(newList);
    },
    [propertiesList, setPropertiesList]
  );

  useEffect(() => {
    if (setCustomProperties) {
      if (!propertiesList) return;
      const filteredList = propertiesList.filter(
        (item) => item.key !== "" && item.value !== ""
      );
      const propertyList = filteredList.map((item) => ({
        [item.key]: item.value
      }));
      setCustomProperties(propertyList);
    }
  }, [propertiesList, setCustomProperties]);

  const handleMoveStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMoveEnd = useCallback(
    (itemId?: string, newIndex?: number) => {
      if (itemId !== undefined && newIndex !== undefined) {
        const itemToMove = propertiesList?.find((item) => item.id === itemId);
        if (itemToMove) {
          handlePropertyDrop(itemToMove, newIndex);
        }
      }
      setIsDragging(false);
    },
    [handlePropertyDrop, propertiesList]
  );

  return {
    isDragging,
    editTitleIndex,
    editTypeIndex,
    handleCustomPropertyAdd,
    handleTitleBlur,
    handleTypeChange,
    handleDoubleClick,
    handleCustomPropertyDelete,
    handlePropertyDrop,
    handleMoveStart,
    handleMoveEnd
  };
}

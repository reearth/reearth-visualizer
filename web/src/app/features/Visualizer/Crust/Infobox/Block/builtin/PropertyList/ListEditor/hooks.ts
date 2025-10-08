import { ValueType, ValueTypes } from "@reearth/app/utils/value";
import { useCallback, useEffect, useState } from "react";

import type { DisplayTypeField, PropertyListField } from ".";

export type ListItem = {
  id: string;
  key: string;
  value: string;
};

export default ({
  propertyId,
  propertyListField,
  displayTypeField,
  onPropertyUpdate
}: {
  propertyId?: string;
  displayTypeField?: DisplayTypeField;
  propertyListField?: PropertyListField;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
}) => {
  const [currentPropertyList, setCurrentPropertyList] = useState<ListItem[]>(
    propertyListField?.value ?? []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [editKeyIndex, setEditKeyIndex] = useState<number | null>(null);
  const [editValueIndex, setEditValueIndex] = useState<number | null>(null);

  const displayOptions = displayTypeField?.choices?.map(
    ({ key, title }: { key: string; title: string }) => ({
      value: key,
      label: title
    })
  );

  const handlePropertyValueUpdate = useCallback(
    (fieldId?: string, vt?: ValueType, itemId?: string) => {
      return async (v?: ValueTypes[ValueType]) => {
        if (!propertyId || !fieldId || !vt) return;
        await onPropertyUpdate?.(propertyId, "default", fieldId, itemId, vt, v);
      };
    },
    [propertyId, onPropertyUpdate]
  );

  useEffect(() => {
    setCurrentPropertyList(propertyListField?.value ?? []);
  }, [propertyListField?.value]);

  const handlePropertyValueRemove = useCallback(
    (idx: number) => {
      if (!currentPropertyList) return;
      const updatedPropertiesList = [...currentPropertyList];
      updatedPropertiesList.splice(idx, 1);
      setCurrentPropertyList?.(updatedPropertiesList);
    },
    [currentPropertyList]
  );

  const handlePropertyListUpdate = useCallback(
    (newList: ListItem[]) =>
      handlePropertyValueUpdate("propertyList", "array")(newList),

    [handlePropertyValueUpdate]
  );

  const handleKeyBlur = useCallback(
    (idx: number) => (newKeyValue?: string) => {
      const newList = currentPropertyList.map((i) => ({ ...i }) as ListItem);
      newList[idx].key = newKeyValue ?? "";
      setCurrentPropertyList(newList);
      if (editKeyIndex === idx) setEditKeyIndex(null);
    },
    [currentPropertyList, editKeyIndex]
  );

  const handleValueBlur = useCallback(
    (idx: number) => (newValue?: string) => {
      const newList = currentPropertyList.map((i) => ({ ...i }) as ListItem);
      newList[idx].value = newValue ?? "";
      setCurrentPropertyList(newList);
      if (editValueIndex === idx) setEditValueIndex(null);
    },
    [currentPropertyList, editValueIndex]
  );

  const handleDisplayTypeUpdate = useCallback(
    (value?: string | string[]) =>
      handlePropertyValueUpdate("displayType", "string")(value),
    [handlePropertyValueUpdate]
  );

  const handleItemAdd = useCallback(() => {
    if (!propertyListField) return;
    const newList = [
      ...currentPropertyList,
      {
        id: generateUniqueId(),
        key: "",
        value: ""
      }
    ];
    setCurrentPropertyList(newList);
  }, [currentPropertyList, propertyListField]);

  const handleMoveStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleItemDrop = useCallback(
    (
      item: {
        id: string;
        key: string;
        value: string;
      },
      targetIndex: number
    ) => {
      const itemIndex = currentPropertyList.findIndex(
        (li) => li.id === item.id
      );
      if (itemIndex === -1) return;

      const newList = [...currentPropertyList];
      newList.splice(itemIndex, 1);
      newList.splice(targetIndex, 0, item);
      setCurrentPropertyList(newList);
    },
    [currentPropertyList]
  );

  const handleMoveEnd = useCallback(
    (itemId?: string, newIndex?: number) => {
      if (itemId !== undefined && newIndex !== undefined) {
        const itemToMove = currentPropertyList?.find(
          (item) => item.id === itemId
        );
        if (itemToMove) {
          handleItemDrop(itemToMove, newIndex);
        }
      }
      setIsDragging(false);
    },
    [currentPropertyList, handleItemDrop]
  );

  const handleDoubleClick = useCallback((idx: number, field: string) => {
    if (field === "key") {
      setEditKeyIndex(idx);
      setEditValueIndex(null);
    } else if (field === "value") {
      setEditValueIndex(idx);
      setEditKeyIndex(null);
    }
  }, []);

  return {
    displayOptions,
    currentPropertyList,
    isDragging,
    editValueIndex,
    editKeyIndex,
    handleKeyBlur,
    handleValueBlur,
    handleDisplayTypeUpdate,
    handleItemAdd,
    handlePropertyValueRemove,
    handleMoveStart,
    handleMoveEnd,
    handleDoubleClick,
    handlePropertyListUpdate
  };
};

function generateUniqueId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

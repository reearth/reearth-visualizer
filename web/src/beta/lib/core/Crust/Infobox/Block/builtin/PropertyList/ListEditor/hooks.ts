import { isEqual } from "lodash-es";
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
  onPropertyUpdate,
}: {
  propertyId?: string;
  displayTypeField?: DisplayTypeField;
  propertyListField?: PropertyListField;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any,
  ) => Promise<void>;
}) => {
  const [currentPropertyList, setCurrentPropertyList] = useState<ListItem[]>(
    propertyListField?.value ?? [],
  );

  const displayOptions = displayTypeField?.choices?.map(
    ({ key, title }: { key: string; title: string }) => ({
      key,
      label: title,
    }),
  );

  useEffect(() => {
    if (propertyListField?.value && !isEqual(propertyListField.value, currentPropertyList)) {
      setCurrentPropertyList(propertyListField?.value);
    }
  }, [propertyListField?.value, currentPropertyList]);

  const handlePropertyValueUpdate = useCallback(
    (fieldId?: string, vt?: any, itemId?: string) => {
      return async (v?: any) => {
        if (!propertyId || !fieldId || !vt) return;
        await onPropertyUpdate?.(propertyId, "default", fieldId, itemId, vt, v);
      };
    },
    [propertyId, onPropertyUpdate],
  );

  const handlePropertyValueRemove = useCallback(
    async (idx: number) => {
      if (propertyListField) {
        const newValue = propertyListField.value?.filter((_, i) => i !== idx);
        await handlePropertyValueUpdate("propertyList", propertyListField.type)(newValue);
      }
    },
    [propertyListField, handlePropertyValueUpdate],
  );

  const handlePropertyListUpdate = useCallback(
    (newList: ListItem[]) => handlePropertyValueUpdate("propertyList", "array")(newList),
    [handlePropertyValueUpdate],
  );

  const handleKeyChange = useCallback(
    (idx: number) => (newKeyValue?: string) => {
      const newList = currentPropertyList.map(i => ({ ...i } as ListItem));
      newList[idx].key = newKeyValue ?? "";
      setCurrentPropertyList(newList);
      handlePropertyListUpdate(newList);
    },
    [currentPropertyList, handlePropertyListUpdate],
  );

  const handleValueChange = useCallback(
    (idx: number) => (newValue?: string) => {
      const newList = currentPropertyList.map(i => ({ ...i } as ListItem));
      newList[idx].value = newValue ?? "";
      setCurrentPropertyList(newList);
      handlePropertyListUpdate(newList);
    },
    [currentPropertyList, handlePropertyListUpdate],
  );

  const handleDisplayTypeUpdate = useCallback(
    (value?: string) => handlePropertyValueUpdate("displayType", "string")(value),
    [handlePropertyValueUpdate],
  );

  const handleItemAdd = useCallback(() => {
    if (!propertyListField) return;
    const newList = [
      ...currentPropertyList,
      {
        id: generateUniqueId(),
        key: `Field ${(currentPropertyList ?? []).length + 1 || 1}`,
        value: `Value ${(currentPropertyList ?? []).length + 1 || 1}`,
      },
    ];
    handlePropertyValueUpdate("propertyList", propertyListField.type)(newList);
  }, [currentPropertyList, propertyListField, handlePropertyValueUpdate]);

  const handleItemDrop: (
    item: {
      id: string;
      key: string;
      value: string;
    },
    targetIndex: number,
  ) => void = useCallback(
    async (item, index) => {
      const newList: ListItem[] = [...currentPropertyList];
      newList.splice(
        currentPropertyList.findIndex(li => li.id === item.id),
        1,
      );
      newList.splice(index, 0, item);

      if (newList.length < 1 || !currentPropertyList) return;
      await onPropertyUpdate?.(propertyId, "default", "propertyList", undefined, "array", newList);
    },
    [currentPropertyList, onPropertyUpdate, propertyId],
  );

  return {
    displayOptions,
    currentPropertyList,
    handleKeyChange,
    handleValueChange,
    handleDisplayTypeUpdate,
    handleItemAdd,
    handleItemDrop,
    handlePropertyValueRemove,
  };
};

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

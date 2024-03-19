import { isEqual } from "lodash-es";
import { useCallback, useEffect, useState } from "react";

import { DisplayTypeField, PropertyListField, PropertyListItem } from ".";

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
    generateListWithId(propertyListField?.value ?? []),
  );

  const displayOptions = displayTypeField?.choices?.map(
    ({ key, title }: { key: string; title: string }) => ({
      key,
      label: title,
    }),
  );

  useEffect(() => {
    if (!isEqual(generateListWithId(propertyListField?.value ?? []), currentPropertyList)) {
      setCurrentPropertyList(generateListWithId(propertyListField?.value ?? []));
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
        const newValue =
          propertyListField.value
            ?.filter((_, i) => i !== idx)
            .map(li => ({ key: li.key, value: li.value })) ?? [];
        await handlePropertyValueUpdate("propertyList", propertyListField.type)(newValue);
      }
    },
    [propertyListField, handlePropertyValueUpdate],
  );

  const handleKeyChange = useCallback(
    (idx: number) => (newValue?: string) =>
      setCurrentPropertyList(list => {
        const newList = list || [];
        newList[idx].key = newValue ?? "";
        return newList;
      }),
    [],
  );

  const handleValueChange = useCallback(
    (idx: number) => (newValue?: string) =>
      setCurrentPropertyList(list => {
        const newList = list || [];
        newList[idx].value = newValue ?? "";
        return newList;
      }),
    [],
  );

  const handleDisplayTypeUpdate = useCallback(
    (value?: string) => handlePropertyValueUpdate("displayType", "string")(value),
    [handlePropertyValueUpdate],
  );

  const handlePropertyListUpdate = useCallback(
    () => handlePropertyValueUpdate("propertyList", "array")(currentPropertyList),
    [currentPropertyList, handlePropertyValueUpdate],
  );

  const handleItemAdd = useCallback(() => {
    if (!propertyListField) return;
    const newList = [
      ...(currentPropertyList?.map(li => ({
        key: li.key,
        value: li.value,
      })) || []),
      {
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
      await onPropertyUpdate?.(
        propertyId,
        "default",
        "propertyList",
        undefined,
        "array",
        newList.map(li => ({ key: li.key, value: li.value })),
      );
    },
    [currentPropertyList, onPropertyUpdate, propertyId],
  );

  return {
    displayOptions,
    currentPropertyList,
    handleKeyChange,
    handleValueChange,
    handleDisplayTypeUpdate,
    handlePropertyListUpdate,
    handleItemAdd,
    handleItemDrop,
    handlePropertyValueRemove,
  };
};

function generateItemId(key: string, index: number) {
  return `${key}-${index}`;
}

function generateListWithId(list: PropertyListItem[]) {
  if (list.length < 1) return [];
  return list.map((li, i) => ({
    id: generateItemId(li.key, i),
    ...li,
  }));
}

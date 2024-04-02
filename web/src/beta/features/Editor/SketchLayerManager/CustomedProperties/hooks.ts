import { useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { Property, PropertyProps } from "..";

export default function useHooks({
  customPropertyList,
  currentProperties,
  setCurrentProperties,
  setCustomPropertyList,
}: {
  customPropertyList?: Property[];
  currentProperties?: PropertyProps[];
  setCustomPropertyList?: (inp: Property[]) => void;
  setCurrentProperties?: (prev: PropertyProps[]) => void;
}) {
  const handleValueChange = useCallback(
    (idx: number) => (newValue?: string) => {
      if (!currentProperties) return;
      const newList = currentProperties?.map(i => ({ ...i } as PropertyProps));
      newList[idx].value = newValue ?? "";
      setCurrentProperties?.(newList);
    },
    [currentProperties, setCurrentProperties],
  );

  const handleKeyChange = useCallback(
    (idx: number) => (newKeyValue?: string) => {
      if (!currentProperties) return;

      const newList = currentProperties.map(i => ({ ...i } as PropertyProps));
      newList[idx].key = newKeyValue ?? "";
      setCurrentProperties?.(newList);
    },
    [currentProperties, setCurrentProperties],
  );

  const handlePropertyAdd = useCallback(() => {
    if (!currentProperties) return;
    const newList = [
      ...currentProperties,
      {
        id: uuidv4(),
        key: "",
        value: "",
      },
    ];
    setCurrentProperties?.(newList);
  }, [currentProperties, setCurrentProperties]);

  const handleRemovePropertyToList = useCallback(
    (idx: number) => {
      if (!customPropertyList || !currentProperties) return;
      const updatedPropertiesList = [...currentProperties];
      updatedPropertiesList.splice(idx, 1);
      setCurrentProperties?.(updatedPropertiesList);
    },
    [customPropertyList, currentProperties, setCurrentProperties],
  );

  const handlePropertyDrop: (item: PropertyProps, targetIndex: number) => void = useCallback(
    (item, index) => {
      if (!currentProperties) return;
      const newList: PropertyProps[] = [...currentProperties];
      newList.splice(
        currentProperties?.findIndex(li => li.id === item.id),
        1,
      );
      newList.splice(index, 0, item);

      if (newList.length < 1 || !currentProperties) return;
      setCurrentProperties?.(newList);
    },
    [currentProperties, setCurrentProperties],
  );

  useEffect(() => {
    if (setCustomPropertyList) {
      if (!currentProperties) return;
      const filteredList = currentProperties.filter(item => item.key !== "" && item.value !== "");
      const propertyList = filteredList.map(item => ({ [item.key]: item.value }));
      setCustomPropertyList(propertyList);
    }
  }, [currentProperties, setCustomPropertyList]);

  return {
    currentProperties,
    handlePropertyAdd,
    handleKeyChange,
    handleValueChange,
    handleRemovePropertyToList,
    handlePropertyDrop,
  };
}

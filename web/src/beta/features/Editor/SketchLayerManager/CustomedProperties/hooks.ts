import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Property } from "..";

export type PropertyProps = {
  id: string;
  key: string;
  value: string;
};
export default function useHooks({
  customPropertyList,
  setCustomPropertyList,
}: {
  customPropertyList?: Property[];
  setCustomPropertyList?: (inp: Property[]) => void;
}) {
  const [currentProperties, setCurrentProperties] = useState<PropertyProps[]>([]);

  const handleValueChange = useCallback(
    (idx: number) => (newValue?: string) => {
      const newList = currentProperties.map(i => ({ ...i } as PropertyProps));
      newList[idx].value = newValue ?? "";
      setCurrentProperties(newList);
    },
    [currentProperties],
  );

  const handleKeyChange = useCallback(
    (idx: number) => (newKeyValue?: string) => {
      const newList = currentProperties.map(i => ({ ...i } as PropertyProps));
      newList[idx].key = newKeyValue ?? "";
      setCurrentProperties(newList);
    },
    [currentProperties],
  );

  const handlePropertyAdd = useCallback(() => {
    const newList = [
      ...currentProperties,
      {
        id: uuidv4(),
        key: "",
        value: "",
      },
    ];
    setCurrentProperties(newList);
  }, [currentProperties]);

  const handleRemovePropertyToList = useCallback(
    (idx: number) => {
      if (!customPropertyList) return;
      const updatedPropertiesList = [...currentProperties];
      updatedPropertiesList.splice(idx, 1);
      setCurrentProperties?.(updatedPropertiesList);
    },
    [customPropertyList, currentProperties],
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
    [currentProperties],
  );

  useEffect(() => {
    if (setCustomPropertyList) {
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

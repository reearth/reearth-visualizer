import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type ConditionListProp = {
  id: string;
  condition: string;
  value: any;
};

export default function useHooks() {
  const [styleConditionList, setStyleConditionList] = useState<
    ConditionListProp[]
  >([]);
  const [, setIsDragging] = useState(false);

  const handleStyleConditionAdd = useCallback(() => {
    if (!styleConditionList) return;
    const newStyleConditionList = [
      ...styleConditionList,
      {
        id: uuidv4(),
        condition: "",
        value: undefined
      }
    ];
    setStyleConditionList?.(newStyleConditionList);
  }, [styleConditionList]);

  const handleStyleConditionListDelete = useCallback(
    (idx: number) => {
      if (!styleConditionList) return;
      const updatedStyleConditionList = [...styleConditionList];
      updatedStyleConditionList.splice(idx, 1);
      setStyleConditionList?.(updatedStyleConditionList);
    },
    [styleConditionList]
  );

  const handleItemDrop = useCallback(
    (item: ConditionListProp, targetIndex: number) => {
      if (
        !styleConditionList ||
        targetIndex < 0 ||
        targetIndex >= styleConditionList.length
      )
        return;

      const newList = [...styleConditionList];
      const currentIndex = newList.findIndex((li) => li.id === item.id);
      if (currentIndex === -1) return;
      const [draggedItem] = newList.splice(currentIndex, 1);

      // Insert the item at the target index
      newList.splice(targetIndex, 0, draggedItem);

      setStyleConditionList?.(newList);
    },
    [styleConditionList]
  );

  const handleMoveStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMoveEnd = useCallback(
    (itemId?: string, newIndex?: number) => {
      if (itemId !== undefined && newIndex !== undefined) {
        const itemToMove = styleConditionList?.find(
          (item) => item.id === itemId
        );
        if (itemToMove) {
          handleItemDrop(itemToMove, newIndex);
        }
      }
      setIsDragging(false);
    },
    [styleConditionList, handleItemDrop]
  );

  return {
    styleConditionList,
    handleStyleConditionAdd,
    handleStyleConditionListDelete,
    handleMoveStart,
    handleMoveEnd
  };
}

import { useCallback, Dispatch, SetStateAction, useState } from "react";

import { Condition } from "../type";

type Props = {
  conditions: Condition[];
  setConditions: Dispatch<SetStateAction<Condition[]>>;
};

export default function useHooks({ conditions, setConditions }: Props) {
  const [, setIsDragging] = useState(false);

  const handleConditionChange = useCallback(
    (
      idx: number,
      partIdx: "variable" | "operator" | "value",
      value: string
    ) => {
      const newConditions = [...conditions];
      const currentCondition = newConditions[idx][0].split(" ");
      if (partIdx === "variable") {
        currentCondition[0] = value;
      } else if (partIdx === "operator") {
        currentCondition[1] = value;
      } else if (partIdx === "value") {
        currentCondition[2] = `${value}`;
      }
      newConditions[idx][0] = currentCondition.join(" ");
      setConditions(newConditions);
    },
    [conditions, setConditions]
  );

  const handleStyleConditionAdd = useCallback(() => {
    const newConditions: Condition[] = [...conditions, ["", ""]];
    setConditions(newConditions);
  }, [conditions, setConditions]);

  const handleStyleConditionListDelete = useCallback(
    (idx: number) => {
      const newConditions = [...conditions];
      newConditions.splice(idx, 1);
      setConditions(newConditions);
    },
    [conditions, setConditions]
  );

  const getProcessedCondition = useCallback((conditionString: string) => {
    const normalized = conditionString.replace(/([=<>!]+)/g, " $1 ").trim();
    const parts = normalized.split(" ").filter((part) => part !== "");

    const variable = parts[0] || "";
    const operator = parts[1] || "";

    const value = parts.slice(2).join(" ").trim();
    return [variable, operator, value];
  }, []);

  const handleItemDrop = useCallback(
    (draggedIndex: number, targetIndex: number) => {
      if (
        targetIndex < 0 ||
        targetIndex >= conditions.length ||
        draggedIndex === targetIndex
      )
        return;
      const newList = [...conditions];
      const [draggedItem] = newList.splice(draggedIndex, 1);
      newList.splice(targetIndex, 0, draggedItem);

      setConditions(newList);
    },
    [conditions, setConditions]
  );

  const handleMoveStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMoveEnd = useCallback(
    (itemIdx?: string, newIndex?: number) => {
      if (itemIdx !== undefined && newIndex !== undefined) {
        const parsedIndex = parseInt(itemIdx, 10);
        if (!isNaN(parsedIndex)) {
          handleItemDrop(parsedIndex, newIndex);
        }
      }
      setIsDragging(false);
    },
    [handleItemDrop]
  );

  return {
    handleConditionChange,
    handleStyleConditionAdd,
    handleStyleConditionListDelete,
    getProcessedCondition,
    handleMoveStart,
    handleMoveEnd
  };
}

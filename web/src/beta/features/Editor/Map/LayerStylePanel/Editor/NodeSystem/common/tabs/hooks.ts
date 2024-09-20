import { useCallback, Dispatch, SetStateAction } from "react";

import { Condition } from "../type";

type Props = {
  conditions: Condition[];
  setConditions: Dispatch<SetStateAction<Condition[]>>;
};

export const conditionRegex =
  /(\${[^}]+}|[a-zA-Z0-9_]+)\s*(===|==|!=|>|<|>=|<=)\s*("[^"]+"|'[^']+'|[a-zA-Z0-9_]+)/;

export default function useHooks({ conditions, setConditions }: Props) {
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

  return {
    handleConditionChange,
    handleStyleConditionAdd,
    handleStyleConditionListDelete
  };
}

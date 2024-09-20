import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { SetStateAction } from "jotai";
import { Dispatch, useCallback, useEffect, useState } from "react";

import { LayerStyleProps } from "../../InterfaceTab";

import { AppearanceType, AppearanceTypeKeys, Condition, Tabs } from "./type";

type UseAppearanceHookParams<T extends AppearanceType> = {
  appearanceType: T;
  appearanceTypeKey: AppearanceTypeKeys;
  defaultValue: any;
  value: any;
  expression: string;
  setValue: (val: any) => void;
  setExpression: Dispatch<SetStateAction<string>>;
  conditions: Condition[];
  setConditions: Dispatch<SetStateAction<Condition[]>>;
} & LayerStyleProps;

export default function useHooks<T extends AppearanceType>({
  appearanceType,
  appearanceTypeKey,
  defaultValue,
  value,
  setValue,
  expression,
  setExpression,
  conditions,
  setConditions,
  layerStyle,
  setLayerStyle
}: UseAppearanceHookParams<T>) {
  const t = useT();
  const [, setNotification] = useNotification();
  const [activeTab, setActiveTab] = useState<Tabs>("value");

  const styleValue = layerStyle?.value[appearanceType]?.[appearanceTypeKey];

  useEffect(() => {
    if (styleValue !== undefined) {
      if (typeof styleValue === "object") {
        if (
          typeof styleValue.expression === "object" &&
          "conditions" in styleValue.expression
        ) {
          const conditionArray = (
            styleValue.expression as { conditions: Condition[] }
          ).conditions;
          setConditions(conditionArray);
          setValue(defaultValue);
          setExpression("");
          setActiveTab("condition");
        } else if (typeof styleValue.expression === "string") {
          setExpression(styleValue.expression as string);
          setValue(defaultValue);
          setActiveTab("expression");
        }
      } else {
        setValue(styleValue);
        setExpression("");
        setConditions([]);
        setActiveTab("value");
      }
    }
  }, [styleValue, setValue, setExpression, defaultValue, setConditions]);

  useEffect(() => {
    try {
      setLayerStyle((prev) => {
        if (!prev?.id) return prev;
        let newStyleValue = expression ? { expression } : value;

        if (conditions.length > 0) {
          newStyleValue = { expression: { conditions } };
        }

        return {
          ...prev,
          value: {
            ...prev.value,
            [appearanceType]: {
              ...prev.value?.[appearanceType],
              [appearanceTypeKey]: newStyleValue
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [
    value,
    expression,
    setLayerStyle,
    setNotification,
    t,
    appearanceType,
    appearanceTypeKey,
    conditions
  ]);

  const handleChange = useCallback(
    (type: "value" | "expression", newValue: any) => {
      if (type === "value") {
        setValue(newValue);
        setExpression("");
        setConditions([]);
      } else if (type === "expression") {
        setExpression(newValue as string);
        setValue(defaultValue);
        setConditions([]);
      }
    },
    [setValue, setExpression, defaultValue, setConditions]
  );

  const handleConditionStatementChange = useCallback(
    (idx: number, newValue: any) => {
      const updatedConditions = [...conditions];
      updatedConditions[idx][1] = newValue;
      setConditions(updatedConditions);
    },
    [conditions, setConditions]
  );

  const handleTabChange = useCallback((newTab: Tabs) => {
    setActiveTab(newTab);
  }, []);

  return {
    activeTab,
    handleTabChange,
    handleChange,
    handleConditionStatementChange
  };
}

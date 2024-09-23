import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { SetStateAction } from "jotai";
import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import { AppearanceType, AppearanceTypeKeys, Condition, Tabs } from "../type";

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

  const hasSetConditions = useRef(false);

  const layerStyleValue = useMemo(() => {
    return layerStyle?.value[appearanceType]?.[appearanceTypeKey];
  }, [appearanceType, appearanceTypeKey, layerStyle?.value]);

  useEffect(() => {
    if (layerStyleValue !== undefined) {
      if (typeof layerStyleValue === "object") {
        if (
          typeof layerStyleValue?.expression === "object" &&
          "conditions" in layerStyleValue.expression
        ) {
          const conditionArray = (
            layerStyleValue.expression as { conditions: Condition[] }
          ).conditions;
          setConditions(conditionArray);
          setValue(defaultValue);
          setExpression("");
          setActiveTab("condition");
          hasSetConditions.current = false;
        } else if (typeof layerStyleValue.expression === "string") {
          setExpression(layerStyleValue.expression as string);
          setValue(defaultValue);
          if (!hasSetConditions.current) {
            setConditions([]);
            hasSetConditions.current = true;
          }

          setActiveTab("expression");
        }
      } else {
        setValue(layerStyleValue);
        setExpression("");
        if (!hasSetConditions.current) {
          setConditions([]);
          hasSetConditions.current = true;
        }

        setActiveTab("value");
      }
    }
  }, [
    setValue,
    setExpression,
    defaultValue,
    setConditions,
    appearanceType,
    appearanceTypeKey,
    layerStyleValue
  ]);

  useEffect(() => {
    try {
      setLayerStyle((prev) => {
        if (!prev?.id) return prev;
        let newLayerStyleValue = expression ? { expression } : value;

        if (conditions.length > 0) {
          newLayerStyleValue = { expression: { conditions } };
        }

        return {
          ...prev,
          value: {
            ...prev.value,
            [appearanceType]: {
              ...prev.value?.[appearanceType],
              [appearanceTypeKey]: newLayerStyleValue
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

  const handleConditionChange = useCallback(
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
    handleConditionChange,
    handleConditionStatementChange
  };
}

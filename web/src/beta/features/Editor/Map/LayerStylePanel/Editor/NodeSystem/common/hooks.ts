import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { useCallback, useEffect } from "react";

import { LayerStyleProps } from "../../InterfaceTab";

import { AppearanceType, AppearanceTypeKeys } from "./type";

type UseAppearanceHookParams<T extends AppearanceType> = {
  appearanceType: T;
  appearanceTypeKey: AppearanceTypeKeys;
  defaultValue: any;
  value: any;
  expression: string;
  setValue: (val: any) => void;
  setExpression: (val: string) => void;
} & LayerStyleProps;

export default function useHooks<T extends AppearanceType>({
  layerStyle,
  appearanceType,
  appearanceTypeKey,
  defaultValue,
  value,
  setValue,
  expression,
  setExpression,
  setLayerStyle
}: UseAppearanceHookParams<T>) {
  const t = useT();
  const [, setNotification] = useNotification();

  const styleValue = layerStyle?.value[appearanceType]?.[appearanceTypeKey];

  useEffect(() => {
    if (styleValue) {
      if (typeof styleValue === "object" && "expression" in styleValue) {
        setExpression((styleValue as { expression: string }).expression);
        setValue(defaultValue);
      } else {
        setValue(styleValue);
        setExpression("");
      }
    }
  }, [styleValue, setValue, setExpression, defaultValue]);

  useEffect(() => {
    try {
      setLayerStyle((prev) => {
        if (!prev?.id) return prev;
        const newStyleValue = expression ? { expression } : value;
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
    appearanceTypeKey
  ]);

  const handleChange = useCallback(
    (type: "value" | "expression", newValue: any) => {
      if (type === "value") {
        setValue(newValue);
        setExpression("");
      } else if (type === "expression") {
        setExpression(newValue as string);
        setValue(defaultValue);
      }
    },
    [setValue, setExpression, defaultValue]
  );

  return {
    handleChange
  };
}

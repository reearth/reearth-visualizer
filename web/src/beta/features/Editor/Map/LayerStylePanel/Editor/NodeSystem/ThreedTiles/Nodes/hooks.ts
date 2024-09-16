import { Cesium3DTilesAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { useEffect, useCallback } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";

type Props<K extends keyof Cesium3DTilesAppearance> = {
  apperanceTypeKey: K;
  value: Cesium3DTilesAppearance[K];
  defaultValue?: Cesium3DTilesAppearance[K];
  expression: string;
  setValue: (val: Cesium3DTilesAppearance[K]) => void;
  setExpression: (val: string) => void;
} & LayerStyleProps;

export default function useHooks<K extends keyof Cesium3DTilesAppearance>({
  apperanceTypeKey,
  layerStyle,
  value,
  expression,
  defaultValue,
  setValue,
  setExpression,
  setLayerStyle
}: Props<K>) {
  const t = useT();
  const [, setNotification] = useNotification();

  const styleValue = layerStyle?.value["3dtiles"]?.[apperanceTypeKey] as
    | Cesium3DTilesAppearance[K]
    | undefined;

  useEffect(() => {
    if (!styleValue) return;
    if (typeof styleValue === "object" && "expression" in styleValue) {
      setExpression((styleValue as { expression: string }).expression);
    } else {
      setValue(styleValue);
      setExpression("");
    }
  }, [styleValue, setValue, setExpression]);

  useEffect(() => {
    try {
      setLayerStyle((prev) => {
        if (!prev?.id) return prev;
        const newStyleValue = expression !== "" ? { expression } : value;
        return {
          ...prev,
          value: {
            ...prev.value,
            ["3dtiles"]: {
              ...prev.value?.["3dtiles"],
              [apperanceTypeKey]: newStyleValue
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [value, expression, setLayerStyle, setNotification, t, apperanceTypeKey]);

  const handleChange = useCallback(
    (
      type: "value" | "expression",
      newValue: Cesium3DTilesAppearance[K] | string
    ) => {
      if (type === "value") {
        setValue(newValue as Cesium3DTilesAppearance[K]);
        setExpression("");
      } else if (type === "expression") {
        setExpression(newValue as string);
        setValue(defaultValue);
      }
    },
    [setValue, setExpression, defaultValue]
  );

  return { handleChange };
}

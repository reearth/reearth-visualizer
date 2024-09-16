import { PolylineAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { useEffect, useCallback } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";

type Props<K extends keyof PolylineAppearance> = {
  apperanceTypeKey: K;
  value: PolylineAppearance[K];
  defaultValue?: PolylineAppearance[K];
  expression: string;
  setValue: (val: PolylineAppearance[K]) => void;
  setExpression: (val: string) => void;
} & LayerStyleProps;

export default function useHooks<K extends keyof PolylineAppearance>({
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

  const styleValue = layerStyle?.value?.polyline?.[apperanceTypeKey] as
    | PolylineAppearance[K]
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
            polyline: {
              ...prev.value?.polyline,
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
      newValue: PolylineAppearance[K] | string
    ) => {
      if (type === "value") {
        setValue(newValue as PolylineAppearance[K]);
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

import { NumberInput } from "@reearth/beta/lib/reearth-ui";
import { PolylineAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useEffect, useState } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import NodeSystem from "../../NodeSystem";
import ConditionalTab from "../../NodeSystem/ConditionTab";
import ExpressionTab from "../../NodeSystem/ExpressionTab";

const StrokeWidthNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<PolylineAppearance["strokeWidth"]>(
    layerStyle?.value.polyline?.strokeWidth ?? 0
  );
  const t = useT();
  const [, setNotification] = useNotification();

  useEffect(() => {
    if (layerStyle?.value.polyline?.strokeWidth)
      setValue(layerStyle?.value.polyline?.strokeWidth);
  }, [layerStyle]);

  useEffect(() => {
    try {
      setLayerStyle((prev) => {
        if (!prev?.id) return prev;
        return {
          ...prev,
          value: {
            ...prev.value,
            polyline: {
              ...prev.value?.polyline,
              strokeWidth: value
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [setLayerStyle, setNotification, setValue, t, value]);

  const renderContent: Record<string, JSX.Element> = {
    value: <NumberInput value={value} onChange={setValue} />,
    expression: <ExpressionTab value="" />,
    condition: (
      <ConditionalTab>
        <NumberInput value={value} onChange={setValue} />
      </ConditionalTab>
    )
  };
  return (
    <NodeSystem title="StrokeWidth" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default StrokeWidthNode;

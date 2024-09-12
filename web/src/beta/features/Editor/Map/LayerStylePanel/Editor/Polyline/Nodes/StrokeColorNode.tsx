import { ColorInput } from "@reearth/beta/lib/reearth-ui";
import { PolylineAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useEffect, useState } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import NodeSystem from "../../NodeSystem";
import ConditionalTab from "../../NodeSystem/ConditionTab";
import ExpressionTab from "../../NodeSystem/ExpressionTab";

const StrokeColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [value, setValue] = useState<PolylineAppearance["strokeColor"]>(
    layerStyle?.value.polyline?.strokeColor ?? null
  );

  useEffect(() => {
    if (layerStyle?.value.polyline?.strokeColor)
      setValue(layerStyle?.value.polyline?.strokeColor);
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
              strokeColor: value
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [setLayerStyle, setNotification, setValue, t, value]);

  const renderContent: Record<string, JSX.Element> = {
    value: <ColorInput value={value} onChange={setValue} />,
    expression: <ExpressionTab value={value} onChange={setValue} />,
    condition: (
      <ConditionalTab>
        <ColorInput value={value} onChange={setValue} />
      </ConditionalTab>
    )
  };
  return (
    <NodeSystem title="StrokeColor" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default StrokeColorNode;

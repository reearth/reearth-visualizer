import { ColorInput } from "@reearth/beta/lib/reearth-ui";
import { MarkerAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useEffect, useState } from "react";

import NodeSystem from "../..";
import { LayerStyleProps } from "../../../InterfaceTab";
import ConditionalTab from "../../ConditionalTab";
import ExpressionTab from "../../ExpressionTab";

const PointColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [value, setValue] = useState<MarkerAppearance["pointColor"]>(
    layerStyle?.value.marker?.pointColor ?? null
  );

  useEffect(() => {
    if (layerStyle?.value.marker?.pointColor)
      setValue(layerStyle?.value.marker?.pointColor);
  }, [layerStyle]);

  useEffect(() => {
    try {
      setLayerStyle((prev) => {
        if (!prev?.id) return prev;
        return {
          ...prev,
          value: {
            ...prev.value,
            marker: {
              ...prev.value?.marker,
              pointColor: value
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
    <NodeSystem title="PointColor" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default PointColorNode;

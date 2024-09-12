import { NumberInput } from "@reearth/beta/lib/reearth-ui";
import { MarkerAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useEffect, useState } from "react";

import NodeSystem from "../..";
import { LayerStyleProps } from "../../../InterfaceTab";
import ConditionalTab from "../../ConditionalTab";
import ExpressionTab from "../../ExpressionTab";

const PointSizeNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<MarkerAppearance["pointSize"]>(
    layerStyle?.value.marker?.pointSize ?? 0
  );
  const t = useT();
  const [, setNotification] = useNotification();

  useEffect(() => {
    if (layerStyle?.value.marker?.pointSize)
      setValue(layerStyle?.value.marker?.pointSize);
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
              pointSize: value
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
    <NodeSystem title="PointSize" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default PointSizeNode;

import { NumberInput } from "@reearth/beta/lib/reearth-ui";
import { MarkerAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useEffect, useState } from "react";

import NodeSystem from "../..";
import { LayerStyleProps } from "../../../InterfaceTab";
import ConditionalTab from "../../ConditionalTab";
import ExpressionTab from "../../ExpressionTab";

const HeightNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<MarkerAppearance["height"]>(
    (layerStyle?.value.marker?.height as number) ?? 0
  );

  const t = useT();
  const [, setNotification] = useNotification();

  useEffect(() => {
    if (layerStyle?.value.marker?.height) {
      setValue(layerStyle.value.marker.height);
    }
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
              ...prev.value.marker,
              height: value
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [value, setLayerStyle, setNotification, t]);

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
    <NodeSystem title="Height" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default HeightNode;

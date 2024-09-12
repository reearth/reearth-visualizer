import { Switcher } from "@reearth/beta/lib/reearth-ui";
import { PolylineAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useCallback, useEffect, useState } from "react";

import NodeSystem from "../..";
import { LayerStyleProps } from "../../../InterfaceTab";
import ConditionalTab from "../../ConditionalTab";
import ExpressionTab from "../../ExpressionTab";

const ClampToGround: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<PolylineAppearance["clampToGround"]>(
    layerStyle?.value.polyline?.clampToGround ?? false
  );
  const t = useT();
  const [, setNotification] = useNotification();

  useEffect(() => {
    if (layerStyle?.value.polyline?.clampToGround)
      setValue(layerStyle?.value.polyline?.clampToGround);
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
              clampToGround: value
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [setLayerStyle, setNotification, setValue, t, value]);

  const handleChange = useCallback((value: boolean) => {
    setValue?.(value);
  }, []);

  const renderContent: Record<string, JSX.Element> = {
    value: <Switcher value={value} onChange={handleChange} />,
    expression: <ExpressionTab value="" />,
    condition: (
      <ConditionalTab>
        <Switcher value={value} onChange={handleChange} />
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title="clampToGround" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default ClampToGround;

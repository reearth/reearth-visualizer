import { Selector } from "@reearth/beta/lib/reearth-ui";
import { MarkerAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useCallback, useEffect, useState } from "react";

import NodeSystem from "../..";
import { LayerStyleProps } from "../../../InterfaceTab";
import ConditionalTab from "../../ConditionalTab";
import ExpressionTab from "../../ExpressionTab";

const options = [
  {
    value: "none",
    label: "none"
  },
  {
    value: "point",
    label: "point"
  },
  {
    value: "image",
    label: "image"
  }
];

const StylesNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [styleValue, setStyleValue] = useState<MarkerAppearance["style"]>(
    layerStyle?.value.marker?.style ?? "none"
  );

  const t = useT();
  const [, setNotification] = useNotification();

  const handleChange = useCallback((value: string | string[]) => {
    if (typeof value !== "string") return;
    setStyleValue?.(value as MarkerAppearance["style"]);
  }, []);

  useEffect(() => {
    if (layerStyle?.value.marker?.style)
      setStyleValue(layerStyle?.value.marker?.style);
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
              style: styleValue
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [setLayerStyle, setNotification, styleValue, t]);

  const renderContent: Record<string, JSX.Element> = {
    value: (
      <Selector value={styleValue} options={options} onChange={handleChange} />
    ),
    expression: <ExpressionTab value="" />,
    condition: (
      <ConditionalTab>
        <Selector
          value={styleValue}
          options={options}
          onChange={handleChange}
        />
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title="Style" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default StylesNode;

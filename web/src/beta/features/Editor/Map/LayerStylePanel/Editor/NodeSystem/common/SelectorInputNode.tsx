import { Selector } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC, useCallback } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import ConditionalTab from "../tabs/ConditionalTab";
import ExpressionTab from "../tabs/ExpressionTab";

import useHooks from "./hooks";
import { AppearanceType, AppearanceTypeKeys } from "./type";

import NodeSystem from ".";

const SelectorInputNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
    appearanceTypeKey: AppearanceTypeKeys;
    options: { value: string; label?: string }[];
    title?: string;
    value: string | undefined;
    expression: string;
    setValue: Dispatch<SetStateAction<any | undefined>>;
    setExpression: (val: string) => void;
  }
> = ({
  optionsMenu,
  title,
  layerStyle,
  appearanceType,
  appearanceTypeKey,
  options,
  value,
  expression,
  setValue,
  setExpression,
  setLayerStyle
}) => {
  const { handleChange } = useHooks({
    appearanceType,
    appearanceTypeKey,
    layerStyle,
    defaultValue: options[0].label,
    value,
    expression,
    setValue,
    setExpression,
    setLayerStyle
  });

  const handleSelectorChange = useCallback(
    (newValue?: string | string[]) => {
      if (!newValue) return;
      handleChange("value", newValue as string);
    },
    [handleChange]
  );

  const renderContent: Record<string, JSX.Element> = {
    value: (
      <Selector
        value={value}
        options={options}
        onChange={handleSelectorChange}
      />
    ),
    expression: (
      <ExpressionTab
        value={expression}
        onChange={(val) => handleChange("expression", val as string)}
      />
    ),
    //TODO: will be implemented in next step
    condition: (
      <ConditionalTab>
        <Selector options={options} />
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title={title} optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default SelectorInputNode;

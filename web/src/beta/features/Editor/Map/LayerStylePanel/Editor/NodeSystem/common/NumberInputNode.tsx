import { NumberInput } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import ConditionalTab from "../tabs/ConditionalTab";
import ExpressionTab from "../tabs/ExpressionTab";

import useHooks from "./hooks";
import { AppearanceType, AppearanceTypeKeys } from "./type";

import NodeSystem from ".";

export const DEFAULT_NUMBER_VALUE = 0;

const NumberInputNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
    appearanceTypeKey: AppearanceTypeKeys;
    title?: string;
    value: number | undefined;
    expression: string;
    setValue: Dispatch<SetStateAction<number | undefined>>;
    setExpression: (val: string) => void;
  }
> = ({
  optionsMenu,
  title,
  appearanceType,
  appearanceTypeKey,
  layerStyle,
  setLayerStyle,
  value,
  setValue,
  expression,
  setExpression
}) => {
  const { handleChange } = useHooks({
    appearanceType,
    appearanceTypeKey,
    layerStyle,
    defaultValue: DEFAULT_NUMBER_VALUE,
    value,
    expression,
    setValue,
    setExpression,
    setLayerStyle
  });
  const renderContent: Record<string, JSX.Element> = {
    value: (
      <NumberInput
        value={value}
        onChange={(val) => handleChange("value", val)}
      />
    ),
    expression: (
      <ExpressionTab
        value={expression}
        onChange={(val) => handleChange("expression", val)}
      />
    ),
    condition: (
      <ConditionalTab>
        <NumberInput />
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title={title} optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default NumberInputNode;

import { NumberInput } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import useHooks from "./hooks";
import ConditionalTab from "./tabs/ConditionalTab";
import ExpressionTab from "./tabs/ExpressionTab";
import { CommonIputProp } from "./type";

import NodeSystem from ".";

export const DEFAULT_NUMBER_VALUE = 0;

const NumberInputNode: FC<
  CommonIputProp & {
    value: number | undefined;
    setValue: Dispatch<SetStateAction<number | undefined>>;
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
  setExpression,
  conditions,
  setConditions
}) => {
  const {
    activeTab,
    handleTabChange,
    handleChange,
    handleConditionStatementChange
  } = useHooks({
    appearanceType,
    appearanceTypeKey,
    layerStyle,
    defaultValue: DEFAULT_NUMBER_VALUE,
    value,
    setValue,
    expression,
    setExpression,
    conditions,
    setConditions,
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
      <ConditionalTab conditions={conditions} setConditions={setConditions}>
        {(idx) => (
          <NumberInput
            value={(conditions[idx][1] as number) || ""}
            onChange={(val) => handleConditionStatementChange(idx, val)}
          />
        )}
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem
      title={title}
      optionsMenu={optionsMenu}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default NumberInputNode;

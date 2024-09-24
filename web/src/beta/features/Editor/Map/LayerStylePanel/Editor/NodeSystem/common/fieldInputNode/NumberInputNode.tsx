import { NumberInput } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import ConditionalTab from "../ConditionalTab";
import ExpressionTab from "../ExpressionTab";
import { CommonInputProp, Tabs } from "../type";

import useHooks from "./hooks";

import NodeSystem from ".";

export const DEFAULT_NUMBER_VALUE = 0;

const NumberInputNode: FC<
  CommonInputProp & {
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
    handleConditionChange,
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

  const renderContent: Record<Tabs, JSX.Element> = {
    value: (
      <NumberInput
        value={value}
        onChange={(val) => handleConditionChange("value", val)}
      />
    ),
    expression: (
      <ExpressionTab
        value={expression}
        onBlur={(val) => handleConditionChange("expression", val)}
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

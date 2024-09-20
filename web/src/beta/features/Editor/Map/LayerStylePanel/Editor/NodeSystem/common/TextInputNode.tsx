import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import useHooks from "./hooks";
import ConditionalTab from "./tabs/ConditionalTab";
import ExpressionTab from "./tabs/ExpressionTab";
import { CommonIputProp } from "./type";

import NodeSystem from ".";

export const DEFAULT_TEXT_VALUE = "";

const TextInputNode: FC<
  CommonIputProp & {
    value: string | undefined;
    setValue: Dispatch<SetStateAction<string | undefined>>;
  }
> = ({
  optionsMenu,
  title,
  appearanceType,
  appearanceTypeKey,
  value,
  expression,
  setValue,
  setExpression,
  setLayerStyle,
  layerStyle,
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
    defaultValue: DEFAULT_TEXT_VALUE,
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
      <TextInput value={value} onChange={(val) => handleChange("value", val)} />
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
          <TextInput
            value={(conditions[idx][1] as string) || ""}
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

export default TextInputNode;

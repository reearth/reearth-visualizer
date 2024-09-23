import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import ConditionalTab from "../tabs/ConditionalTab";
import ExpressionTab from "../tabs/ExpressionTab";
import { CommonIputProp } from "../type";

import useHooks from "./hooks";

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
    handleConditionChange,
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
      <TextInput
        value={value}
        onBlur={(val) => handleConditionChange("value", val)}
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
          <TextInput
            value={(conditions[idx][1] as string) || ""}
            onBlur={(val) => handleConditionStatementChange(idx, val)}
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

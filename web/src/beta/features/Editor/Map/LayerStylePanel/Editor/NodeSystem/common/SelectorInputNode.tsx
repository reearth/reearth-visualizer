import { Selector } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC, useCallback } from "react";

import useHooks from "./hooks";
import ConditionalTab from "./tabs/ConditionalTab";
import ExpressionTab from "./tabs/ExpressionTab";
import { CommonIputProp } from "./type";

import NodeSystem from ".";

const SelectorInputNode: FC<
  CommonIputProp & {
    options: { value: string; label?: string }[];
    value: string | undefined;
    setValue: Dispatch<SetStateAction<any | undefined>>;
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
  setLayerStyle,
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
    defaultValue: options[0].label,
    value,
    setValue,
    expression,
    setExpression,
    conditions,
    setConditions,
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

    condition: (
      <ConditionalTab conditions={conditions} setConditions={setConditions}>
        {(idx) => (
          <Selector
            options={options}
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

export default SelectorInputNode;

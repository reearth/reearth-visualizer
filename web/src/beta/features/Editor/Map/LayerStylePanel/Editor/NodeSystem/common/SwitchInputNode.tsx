import { Switcher } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import ConditionalTab from "../tabs/ConditionalTab";
import ExpressionTab from "../tabs/ExpressionTab";

import useHooks from "./hooks";
import { AppearanceType, AppearanceTypeKeys } from "./type";

import NodeSystem from ".";

export const DEFAULT_SWITCH_VALUE = false;

const SwitchInputNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
    appearanceTypeKey: AppearanceTypeKeys;
    title?: string;
    value: boolean | undefined;
    expression: string;
    setValue: Dispatch<SetStateAction<boolean | undefined>>;
    setExpression: (val: string) => void;
  }
> = ({
  optionsMenu,
  title,
  layerStyle,
  appearanceType,
  appearanceTypeKey,
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
    defaultValue: DEFAULT_SWITCH_VALUE,
    setLayerStyle,
    value,
    setValue,
    expression,
    setExpression
  });

  const renderContent: Record<string, JSX.Element> = {
    value: (
      <Switcher value={value} onChange={(val) => handleChange("value", val)} />
    ),
    expression: (
      <ExpressionTab
        value={expression}
        onChange={(val) => handleChange("expression", val)}
      />
    ),
    condition: (
      <ConditionalTab>
        <Switcher />
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title={title} optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default SwitchInputNode;

import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import ConditionalTab from "../tabs/ConditionalTab";
import ExpressionTab from "../tabs/ExpressionTab";

import useHooks from "./hooks";
import { AppearanceType, AppearanceTypeKeys } from "./type";

import NodeSystem from ".";

export const DEFAULT_TEXT_VALUE = "";

const TextInputNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
    appearanceTypeKey: AppearanceTypeKeys;
    title?: string;
    value: string | undefined;
    expression: string;
    setValue: Dispatch<SetStateAction<string | undefined>>;
    setExpression: (val: string) => void;
  }
> = ({
  optionsMenu,
  title,
  layerStyle,
  appearanceType,
  appearanceTypeKey,
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
    defaultValue: DEFAULT_TEXT_VALUE,
    value,
    expression,
    setValue,
    setExpression,
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
      <ConditionalTab>
        <TextInput />
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title={title} optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default TextInputNode;

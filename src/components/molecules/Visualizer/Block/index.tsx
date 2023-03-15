import { ComponentType } from "react";

import { styled } from "@reearth/theme";
import { ValueType, ValueTypes } from "@reearth/util/value";

import type { SceneProperty } from "../Engine";
import { Viewport } from "../hooks";
import Plugin from "../Plugin";
import type { Block, Layer, InfoboxProperty, CommonProps as PluginCommonProps } from "../Plugin";

import builtin from "./builtin";

export type { Block, Layer } from "../Plugin";

export type Props<BP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  layer?: Layer;
  block?: Block<BP>;
  infoboxProperty?: InfoboxProperty;
  viewport?: Viewport;
  theme?: SceneProperty["theme"];
  onClick?: () => void;
  onChange?: <T extends ValueType>(
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
} & PluginCommonProps;

export type Component<BP = any> = ComponentType<Props<BP>>;

export default function BlockComponent<P = any>({
  pluginBaseUrl,
  ...props
}: Props<P>): JSX.Element | null {
  const Builtin =
    props.block?.pluginId && props.block.extensionId
      ? builtin[`${props.block.pluginId}/${props.block.extensionId}`]
      : undefined;

  return props.viewport ? (
    Builtin ? (
      <Builtin {...props} />
    ) : (
      <Wrapper editable={props?.isEditable} onClick={props?.onClick} selected={props?.isSelected}>
        <Plugin
          autoResize="height-only"
          pluginId={props.block?.pluginId}
          extensionId={props.block?.extensionId}
          sourceCode={(props.block as any)?.__REEARTH_SOURCECODE} // for debugging
          extensionType="block"
          pluginBaseUrl={pluginBaseUrl}
          visible
          property={props.pluginProperty}
          pluginProperty={props.pluginProperty}
          layer={props.layer}
          block={props.block}
          onClick={props.onClick}
          pluginModalContainer={props.pluginModalContainer}
          shownPluginModalInfo={props.shownPluginModalInfo}
          onPluginModalShow={props.onPluginModalShow}
          pluginPopupContainer={props.pluginPopupContainer}
          shownPluginPopupInfo={props.shownPluginPopupInfo}
          onPluginPopupShow={props.onPluginPopupShow}
        />
      </Wrapper>
    )
  ) : null;
}

const Wrapper = styled.div<{ editable?: boolean; selected?: boolean }>`
  border: 1px solid
    ${({ selected, editable, theme }) =>
      editable && selected ? theme.infoBox.accent2 : "transparent"};
  border-radius: 6px;

  &:hover {
    border-color: ${({ editable, theme }) => (editable ? theme.infoBox.border : null)};
  }
`;

import React from "react";
import { useIntl } from "react-intl";

import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

import SelectCore, { OptionElement } from "./core";

// Components

export type Props<Value extends string | number> = {
  className?: string;
  value?: Value;
  placeholder?: string;
  inactive?: boolean;
  color?: string;
  fullWidth?: boolean;
  onChange?: (value: Value) => void;
  children?: OptionElement<Value>[];
  ref?: React.Ref<HTMLDivElement>;
};

const forwardRef = <Value extends string | number>(
  render: (props: Props<Value>, ref: React.Ref<HTMLDivElement>) => React.ReactElement | null,
): typeof Select => React.forwardRef(render) as any;

const Select = <Value extends string | number>(
  {
    className,
    value: selectedValue,
    placeholder,
    inactive = false,
    color,
    fullWidth = false,
    onChange,
    children,
  }: Props<Value>,
  ref: React.Ref<HTMLDivElement>,
) => {
  const intl = useIntl();
  const isValidElement = (object: {} | null | undefined): object is OptionElement<Value> =>
    React.isValidElement(object);
  const options = React.Children.toArray(children).filter(isValidElement);

  const labels = Object.fromEntries(
    options.map(({ props: { value, label } }) => [value, label] as const),
  );
  const selectedLabel = selectedValue ? labels[selectedValue] : null;
  const theme = useTheme();
  return (
    <SelectCore
      className={className}
      ref={ref}
      selectComponent={
        <SelectWrapper>
          <Selected inactive={inactive} size="xs" color={!selectedValue ? theme.main.weak : color}>
            {selectedLabel || placeholder || intl.formatMessage({ defaultMessage: "not set" })}
          </Selected>
          <StyledDownArrow icon="arrowSelect" />
        </SelectWrapper>
      }
      value={selectedValue}
      options={children}
      fullWidth={fullWidth}
      onChange={onChange}></SelectCore>
  );
};

const SelectWrapper = styled.div`
  background: ${props => props.theme.properties.bg};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
`;

const Selected = styled(Text)<{ inactive: boolean }>`
  flex: 1;
  padding: 3px;
`;

const StyledDownArrow = styled(Icon)`
  color: ${props => props.theme.properties.border};
`;

export default forwardRef(Select);

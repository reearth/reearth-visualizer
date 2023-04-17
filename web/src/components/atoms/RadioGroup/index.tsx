import React, { useCallback } from "react";

import { styled } from "@reearth/theme";

type RadioProps<Value extends string | number> = {
  value: Value;
  children?: React.ReactNode;
  focused?: boolean;
  selected?: boolean;
  inactive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

type RadioElement<Value extends string | number> = React.ReactElement<RadioProps<Value>>;

export type Props<Value extends string | number> = {
  className?: string;
  value?: Value;
  inactive?: boolean;
  onChange?: (value: Value) => void;
  children?: RadioElement<Value>[];
  ref?: React.Ref<HTMLUListElement>;
};

const forwardRef = <Value extends string | number>(
  render: (props: Props<Value>, ref: React.Ref<HTMLUListElement>) => React.ReactElement | null,
): typeof RadioGroup => React.forwardRef(render) as any;

const RadioGroup = <Value extends string | number>(
  { className, value: selectedValue, inactive, onChange, children }: Props<Value>,
  ref: React.Ref<HTMLUListElement>,
) => {
  const isValidElement = (object: {} | null | undefined): object is RadioElement<Value> =>
    React.isValidElement(object);
  const checks = React.Children.toArray(children).filter(isValidElement);

  const handleClick = useCallback(
    (value: Value, onClick: RadioProps<Value>["onClick"]) => (e: React.MouseEvent) => {
      onChange?.(value);
      onClick?.(e);
    },
    [onChange],
  );

  return (
    <Wrapper className={className} ref={ref}>
      {checks.map(check => {
        const { value, onClick } = check.props;
        return React.cloneElement(check, {
          selected: value === selectedValue,
          inactive,
          onClick: handleClick(value, onClick),
        });
      })}
    </Wrapper>
  );
};

const Wrapper = styled.ul`
  display: inline-flex;
  margin: 0;
  padding: 0;
  border-radius: 3px;
  box-sizing: border-box;
`;

export default forwardRef(RadioGroup);

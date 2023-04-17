import React, { useCallback } from "react";

import { styled } from "@reearth/theme";

type CheckProps<Value extends string | number> = {
  value: Value;
  children?: React.ReactNode;
  focused?: boolean;
  selected?: boolean;
  inactive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

type CheckElement<Value extends string | number> = React.ReactElement<CheckProps<Value>>;

export type Props<Value extends string | number> = {
  className?: string;
  values?: Value[];
  inactive?: boolean;
  onChange?: (values: Value[]) => void;
  children?: CheckElement<Value>[];
  ref?: React.Ref<HTMLUListElement>;
};

const forwardRef = <Value extends string | number>(
  render: (props: Props<Value>, ref: React.Ref<HTMLUListElement>) => React.ReactElement | null,
): typeof CheckGroup => React.forwardRef(render) as any;

const CheckGroup = <Value extends string | number>(
  { className, values: selectedValues = [], inactive, onChange, children }: Props<Value>,
  ref: React.Ref<HTMLUListElement>,
) => {
  const isValidElement = (object: {} | null | undefined): object is CheckElement<Value> =>
    React.isValidElement(object);
  const checks = React.Children.toArray(children).filter(isValidElement);

  const handleClick = useCallback(
    (value: Value, onClick: CheckProps<Value>["onClick"]) => (e: React.MouseEvent) => {
      const isSelected = selectedValues.includes(value);
      if (isSelected) {
        const values = selectedValues.filter(selectedValue => selectedValue !== value);
        onChange?.(values);
      } else {
        const values = [...selectedValues, value];
        onChange?.(values);
      }
      onClick?.(e);
    },
    [selectedValues, onChange],
  );

  return (
    <Wrapper className={className} ref={ref}>
      {checks.map(check => {
        const { value, onClick } = check.props;
        return React.cloneElement(check, {
          selected: selectedValues.includes(value),
          inactive,
          onClick: handleClick(value, onClick),
        });
      })}
    </Wrapper>
  );
};

const Wrapper = styled.ul`
  display: inline-flex;
  height: 30px;
  margin: 0;
  padding: 0;
  border-radius: 3px;
  box-sizing: border-box;
`;

export default forwardRef(CheckGroup);

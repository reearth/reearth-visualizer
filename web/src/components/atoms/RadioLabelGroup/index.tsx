import React, { useCallback } from "react";

import { RadioLabelProps as BasedRadioLabelProps } from "@reearth/components/atoms/RadioLabel";
import { styled } from "@reearth/theme";

type RadioLabelProps<Value extends string | number> = Omit<BasedRadioLabelProps, "value"> & {
  value: Value;
  children?: React.ReactNode;
};

type RadioLabelElement<Value extends string | number> = React.ReactElement<RadioLabelProps<Value>>;

export type Props<Value extends string | number> = {
  className?: string;
  selectedValue?: Value;
  onChange?: (value: Value) => void;
  children?: RadioLabelElement<Value>[];
  ref?: React.Ref<HTMLElement>;
};

const forwardRef = <Value extends string | number>(
  render: (props: Props<Value>, ref: React.Ref<HTMLElement>) => React.ReactElement | null,
): typeof RadioLabelGroup => React.forwardRef(render) as any;

const RadioLabelGroup = <Value extends string | number>(
  { className, selectedValue, onChange, children }: Props<Value>,
  ref: React.Ref<HTMLElement>,
) => {
  const isValidElement = (object: {} | null | undefined): object is RadioLabelElement<Value> =>
    React.isValidElement(object);

  const radioLabels = React.Children.toArray(children).filter(isValidElement);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.currentTarget?.value) return;
      onChange?.(e.currentTarget.value as Value);
    },
    [onChange],
  );

  return (
    <Wrapper className={className} ref={ref}>
      {radioLabels.map(radio => {
        const { value, label, disabled, inlineChildren, children } = radio.props;
        return React.cloneElement(radio, {
          value,
          label,
          disabled,
          inlineChildren,
          children,
          checked: value === selectedValue,
          handleChange,
        });
      })}
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  > label:not(:last-child) {
    margin-bottom: 16px;
  }
`;

export default forwardRef(RadioLabelGroup);

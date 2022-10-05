import React, { useCallback, useEffect, useRef, useState } from "react";

import { metricsSizes, styled } from "@reearth/theme";

import Icon from "../Icon";
import SelectCore from "../Select/core";
import { Option, OptionIcon } from "../SelectOption";

export type Item<Value extends string | number = string> = {
  value: Value;
  label: string;
  icon?: string;
};

export type Props<Value extends string | number> = {
  className?: string;
  placeholder?: string;
  items?: Item<Value>[];
  fullWidth?: boolean;
  creatable?: boolean;
  onCreate?: (value: Value) => void;
  onSelect?: (value: Value) => void;
};

function AutoComplete<Value extends string | number>({
  className,
  placeholder,
  items,
  fullWidth = false,
  creatable,
  onCreate,
  onSelect,
}: Props<Value>): JSX.Element | null {
  const [filterText, setFilterText] = useState("");
  const [itemState, setItems] = useState<Item<Value>[]>(items ?? []);
  useEffect(() => {
    setItems(items?.filter(i => i.label.includes(filterText)) ?? []);
  }, [filterText, items]);
  const ref = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterText?.(e.currentTarget.value);
    },
    [setFilterText],
  );

  const isValueType = useCallback((value: any): value is Value => {
    return !!value;
  }, []);

  const handleSelect = useCallback(
    (value: Value) => {
      itemState.length ? onSelect?.(value) : creatable && onCreate?.(value);
      setFilterText("");
    },
    [creatable, itemState.length, onCreate, onSelect],
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!isValueType(filterText)) return;
        handleSelect(filterText);
      }
    },
    [filterText, handleSelect, isValueType],
  );

  return (
    <SelectCore
      className={className}
      fullWidth={fullWidth}
      selectComponent={
        <StyledTextBox
          value={filterText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      }
      onChange={handleSelect}
      ref={ref}
      options={itemState?.map(i => {
        return (
          <Option key={i.value} value={i.value} label={i.label}>
            <OptionIcon size="xs">{i.icon && <Icon icon={i.icon} />}</OptionIcon>
            {i.label}
          </Option>
        );
      })}
    />
  );
}

const StyledTextBox = styled.input`
  outline: none;
  width: 100%;
  border: none;
  background-color: ${({ theme }) => theme.properties.bg};
  padding-left: ${metricsSizes.xs}px;
  padding-right: ${metricsSizes.xs}px;
  caret-color: ${({ theme }) => theme.main.text};
  color: ${({ theme }) => theme.main.text};
`;

export default AutoComplete;

import { useState, useCallback, useMemo } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Property from "..";

export type SelectValue<T> = {
  value: T;
  key: string;
};

export type Props<T> = {
  options: SelectValue<T>[];
  onChange: (key: string) => void;
  value?: string;
  disabled?: boolean;
  // Property field
  name?: string;
  description?: string;
};

const SelectField: React.FC<Props<string | number>> = ({
  options,
  onChange,
  value,
  disabled = false,
  name,
  description,
}) => {
  const t = useT();

  const [open, setOpen] = useState(false);

  const handlePopOver = useCallback(() => !disabled && setOpen(!open), [open, disabled]);

  const handleClick = useCallback(
    (key: string) => {
      setOpen(false);
      if (key != value) onChange(key);
    },
    [setOpen, onChange, value],
  );

  const selected = useMemo(() => {
    return options.find(({ key }) => key === value);
  }, [options, value]);

  return (
    <Property name={name} description={description}>
      <Popover.Provider open={open} placement="bottom-start" onOpenChange={handlePopOver}>
        <Popover.Trigger asChild>
          <InputWrapper disabled={disabled} onClick={handlePopOver}>
            <Select selected={selected ? true : false} open={open}>
              {selected ? selected.value : t("Please choose an option")}
            </Select>
            <ArrowDownIcon icon="arrowDown" size={12} />
          </InputWrapper>
        </Popover.Trigger>
        <PickerWrapper>
          {options.map(({ value, key }) => (
            <Option selected={selected?.key == key} key={key} onClick={() => handleClick(key)}>
              {value}
            </Option>
          ))}
        </PickerWrapper>
      </Popover.Provider>
    </Property>
  );
};

const InputWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  gap: 10px;
  position: relative;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const Select = styled.div<{ open: boolean; selected: boolean }>`
  display: flex;
  padding: 4px 8px;
  border-radius: 4px;
  width: 100%;
  font-size: 12px;
  color: ${({ theme, selected }) => (selected ? theme.content.main : theme.content.weaker)};
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;
  border: ${({ theme, open }) =>
    open ? `1px solid ${theme.select.strong}` : `1px solid ${theme.outline.weak}`};

  &:focus {
    border: 1px solid ${({ theme }) => theme.select.strong};
  }

  &:focus-visible {
    border: 1px solid ${({ theme }) => theme.select.strong};
    outline: none;
  }
`;

const ArrowDownIcon = styled(Icon)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
`;

const PickerWrapper = styled(Popover.Content)`
  min-width: 200px;
  gap: 10px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  outline: none;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Option = styled.div<{ selected: boolean }>`
  padding: 4px 12px 4px 12px;
  cursor: pointer;
  font-size: 12px;
  color: ${({ theme, selected }) => (selected ? theme.outline.weak : "inherit")};
  cursor: ${({ selected }) => (selected ? "not-allowed" : "pointer")};

  &:hover {
    background: ${({ theme }) => theme.select.main};
  }
`;

export default SelectField;

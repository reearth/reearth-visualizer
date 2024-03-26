import React, { useState, useCallback, useMemo } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Property from "..";

export type SelectValue = {
  label: string;
  key: string;
};

type CommonProps = {
  className?: string;
  options?: SelectValue[];
  disabled?: boolean;
  // Property field
  name?: string;
  description?: string;
  attachToRoot?: boolean;
};

export type SingleSelectProps = {
  onChange: (key: string) => void;
  value?: string;
  multiSelect?: false;
} & CommonProps;

export type MultiSelectProps = {
  onChange: (keys: string[] | undefined) => void;
  value?: string[];
  multiSelect: true;
} & CommonProps;

export type Props = SingleSelectProps | MultiSelectProps;

// TODO: Fix the onChange method TS error
const SelectField: React.FC<Props> = ({
  className,
  options,
  onChange,
  value,
  multiSelect,
  disabled = false,
  name,
  description,
  attachToRoot,
}) => {
  const t = useT();

  const [open, setOpen] = useState(false);

  const handlePopOver = useCallback(() => !disabled && setOpen(!open), [open, disabled]);

  const handleClick = useCallback(
    (key: string) => {
      if (multiSelect === true) {
        // handle multiselect
        if (value && Array.isArray(value)) {
          const tempArray = [...value];
          tempArray.includes(key)
            ? tempArray.splice(tempArray.indexOf(key), 1)
            : tempArray.push(key);
          onChange(tempArray.length > 0 ? [...tempArray] : undefined);
        } else {
          onChange([key]);
        }
        return;
      }

      setOpen(false);
      key != value && onChange(key);
      return;
    },
    [setOpen, onChange, value, multiSelect],
  );

  const selected = useMemo(() => {
    return value
      ? Array.isArray(value)
        ? value.map(key => ({
            key,
            label: options?.find(x => x.key === key)?.label,
          }))
        : options?.find(x => x.key === value)
      : undefined;
  }, [options, value]);

  const checkSelected = useCallback(
    (key: string) => {
      return value ? (Array.isArray(value) ? value.includes(key) : value === key) : false;
    },
    [value],
  );

  return (
    <Property name={name} description={description} className={className}>
      <Popover.Provider open={open} placement="bottom-start" onOpenChange={handlePopOver}>
        <ProviderWrapper multiSelect={Array.isArray(value) && value.length > 0}>
          <Popover.Trigger asChild>
            <InputWrapper disabled={disabled} onClick={handlePopOver}>
              <Select selected={!!selected} open={open}>
                {selected
                  ? Array.isArray(selected)
                    ? t("Options")
                    : selected.label
                  : t("Please choose an option")}
              </Select>
              <ArrowIcon icon="arrowDown" open={open} size={12} />
            </InputWrapper>
          </Popover.Trigger>
          <PickerWrapper attachToRoot={attachToRoot}>
            {options?.map(({ label: value, key }) => (
              <OptionWrapper
                key={key}
                onClick={() => handleClick(key)}
                selected={checkSelected(key)}>
                {multiSelect && (
                  <CheckIcon icon={checkSelected(key) ? "checkmark" : "plus"} size={12} />
                )}
                <Text size="footnote">{value}</Text>
              </OptionWrapper>
            ))}
          </PickerWrapper>
          {Array.isArray(selected) && (
            <SelectedWrapper>
              {selected.map(({ label, key }) => (
                <Selected key={key} disabled={disabled}>
                  <Text size="footnote" key={key}>
                    {label}
                  </Text>
                  <CancelIcon
                    icon="cancel"
                    size={16}
                    onClick={() => !disabled && handleClick(key)}
                    disabled={disabled}
                  />
                </Selected>
              ))}
            </SelectedWrapper>
          )}
        </ProviderWrapper>
      </Popover.Provider>
    </Property>
  );
};

const ProviderWrapper = styled.div<{ multiSelect: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-radius: 4px;
  width: 100%;
`;

const InputWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  position: relative;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const Select = styled.div<{ open: boolean; selected: boolean }>`
  padding: 9px 8px;
  /* The width + placement of the arrow icon */
  padding-right: 22px;
  border-radius: 4px;
  width: 100%;
  font-size: 12px;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const ArrowIcon = styled(Icon)<{ open: boolean }>`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: ${({ open }) => (open ? "translateY(-50%) scaleY(-1)" : "translateY(-50%)")};
  color: ${({ theme }) => theme.content.main};
`;

const PickerWrapper = styled(Popover.Content)`
  min-width: 150px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  outline: none;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-height: 200px;
  overflow-y: auto;
`;

const OptionWrapper = styled.div<{ selected: boolean }>`
  display: flex;
  padding: 4px 8px;
  align-items: center;
  cursor: "pointer";
  background: ${({ theme, selected }) => (selected ? theme.bg[2] : "inherit")};

  &:hover {
    background: ${({ theme, selected }) => (selected ? theme.bg[2] : theme.select.main)};
  }
`;

const CheckIcon = styled(Icon)`
  margin-right: 12px;
`;

const SelectedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 125px;
  overflow: auto;
`;

const Selected = styled.div<{ disabled: boolean }>`
  display: flex;
  padding: 4px 8px;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg[2]};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const CancelIcon = styled(Icon)<{ disabled: boolean }>`
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  color: ${({ theme }) => theme.content.weak};

  :hover {
    color: ${({ theme }) => theme.content.main};
  }
`;

export default SelectField;

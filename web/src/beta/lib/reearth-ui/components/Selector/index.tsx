import { FC, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import { Button } from "../Button";
import { Icon } from "../Icon";
import { Popup } from "../Popup";
import { Typography } from "../Typography";

export type SelectorProps = {
  multiple?: boolean;
  value?: string | string[];
  options: { value: string; label?: string }[];
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string | string[]) => void;
};

export const Selector: FC<SelectorProps> = ({
  multiple,
  value,
  options,
  placeholder = "Please select",
  disabled,
  onChange,
}) => {
  const theme = useTheme();
  const selectorRef = useRef<HTMLDivElement>(null);
  const [selectedValue, setSelectedValue] = useState<string | string[] | undefined>(
    value ?? (multiple ? [] : undefined),
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectorWidth, setSelectorWidth] = useState<number>();

  const optionValues = useMemo(() => options, [options]);

  useEffect(() => {
    setSelectedValue(value ?? (multiple ? [] : undefined));
  }, [value, multiple]);

  useEffect(() => {
    setSelectorWidth(selectorRef.current?.clientWidth);
  }, [selectorRef]);

  const isSelected = useCallback(
    (value: string) => {
      if (multiple) {
        return Array.isArray(selectedValue) && selectedValue.includes(value);
      }
      return selectedValue === value;
    },
    [multiple, selectedValue],
  );

  const handleChange = (value: string) => {
    if (multiple && Array.isArray(selectedValue)) {
      if (selectedValue.includes(value)) {
        const newSelectedArr = selectedValue.filter(val => val !== value);
        setSelectedValue(newSelectedArr);
        onChange?.(newSelectedArr);
      } else {
        const newSelectedArr = [...selectedValue, value];
        setSelectedValue(newSelectedArr);
        onChange?.(newSelectedArr);
      }
    } else {
      if (value === selectedValue) setSelectedValue(undefined);
      else setSelectedValue(value);
      setIsOpen(!isOpen);
      onChange?.(value);
    }
  };

  const handleUnselect = useCallback(
    (e: MouseEvent<HTMLElement>, value: string) => {
      e.stopPropagation();
      if (Array.isArray(selectedValue) && selectedValue.length) {
        const newSelectedArr = selectedValue.filter(val => val !== value);
        setSelectedValue(newSelectedArr);
        onChange?.(newSelectedArr);
      }
    },
    [selectedValue, onChange],
  );

  const renderTrigger = () => {
    return (
      <SelectInput isMultiple={multiple} isOpen={isOpen} disabled={disabled} width={selectorWidth}>
        {!selectedValue || !selectedValue.length ? (
          <Typography size="body" color={theme.content.weaker}>
            {placeholder}
          </Typography>
        ) : multiple ? (
          <SelectedItems>
            {(selectedValue as string[]).map(val => (
              <SelectedItem key={val}>
                <Typography
                  size="body"
                  color={disabled ? theme.content.weaker : theme.content.main}>
                  {val}
                </Typography>
                {!disabled && (
                  <Button
                    iconButton
                    icon="close"
                    appearance="simple"
                    size="small"
                    onClick={e => handleUnselect(e, val)}
                  />
                )}
              </SelectedItem>
            ))}
          </SelectedItems>
        ) : (
          <Typography size="body" color={disabled ? theme.content.weaker : ""}>
            {selectedValue}
          </Typography>
        )}
        <Icon
          icon={isOpen ? "caretUp" : "caretDown"}
          color={disabled ? theme.content.weaker : theme.content.main}
        />
      </SelectInput>
    );
  };

  return (
    <SelectorWrapper ref={selectorRef}>
      {disabled ? (
        renderTrigger()
      ) : (
        <Popup
          trigger={renderTrigger()}
          open={isOpen}
          onOpenChange={setIsOpen}
          placement="bottom-start">
          <DropDownWrapper width={selectorWidth}>
            {optionValues.map((item: { value: string; label?: string }) => (
              <DropDownItem
                key={item.value}
                isSelected={isSelected(item.value)}
                onClick={() => handleChange(item.value)}>
                <Typography size="body" color={theme.content.main}>
                  {item.label ?? item.value}
                </Typography>
                {isSelected(item.value) && multiple && (
                  <Icon icon="check" size="small" color={theme.content.main} />
                )}
              </DropDownItem>
            ))}
          </DropDownWrapper>
        </Popup>
      )}
    </SelectorWrapper>
  );
};

const SelectorWrapper = styled("div")(() => ({
  width: "100%",
}));

const SelectInput = styled("div")<{
  isMultiple?: boolean;
  isOpen?: boolean;
  disabled?: boolean;
  width?: number;
}>(({ isMultiple, isOpen, disabled, width, theme }) => ({
  boxSizing: "border-box",
  backgroundColor: `${theme.bg[1]}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: `${theme.spacing.small}px`,
  borderRadius: `${theme.radius.smallest}px`,
  border: `1px solid ${isOpen ? theme.select.strong : theme.outline.weak}`,
  boxShadow: `${theme.shadow.input}`,
  padding: `${theme.spacing.smallest}px ${
    isMultiple ? theme.spacing.smallest : theme.spacing.small
  }px`,
  cursor: disabled ? "not-allowed" : "pointer",
  width: width ? `${width}px` : "",
}));

const SelectedItems = styled("div")(({ theme }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: `${theme.spacing.smallest}px`,
  flexWrap: "wrap",
}));

const SelectedItem = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: `${theme.spacing.smallest}px`,
  padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  backgroundColor: `${theme.bg[2]}`,
  borderRadius: `${theme.radius.smallest}px`,
}));

const DropDownWrapper = styled("div")<{
  width?: number;
}>(({ width, theme }) => ({
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.micro}px`,
  padding: `${theme.spacing.micro}px`,
  backgroundColor: `${theme.bg[1]}`,
  boxShadow: `${theme.shadow.popup}`,
  borderRadius: `${theme.radius.small}px`,
  width: width ? `${width}px` : "",
}));

const DropDownItem = styled("div")<{
  isSelected?: boolean;
}>(({ isSelected, theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: `${theme.spacing.small}px`,
  backgroundColor: !isSelected ? `${theme.bg[1]}` : `${theme.select.weak} !important`,
  padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  borderRadius: `${theme.radius.smallest}px`,
  cursor: "pointer",
  ["&:hover"]: {
    backgroundColor: `${theme.bg[2]}`,
  },
}));

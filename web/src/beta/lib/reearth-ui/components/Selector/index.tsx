import { FC, MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import { Button } from "../Button";
import { Icon } from "../Icon";
import { Popup } from "../Popup";
import { Typography } from "../Typography";

export type SelectorProps = {
  isMultiple?: boolean;
  defaultValue?: string | string[];
  values: string[];
  placeholder?: string;
  onChange?: (value: string | string[]) => void;
};

export const Selector: FC<SelectorProps> = ({
  isMultiple,
  defaultValue,
  values,
  placeholder,
  onChange,
}) => {
  const theme = useTheme();
  const [selectedValue, setSelectedValue] = useState<string | string[] | undefined>(
    defaultValue ?? (isMultiple ? [] : undefined),
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownValues = useMemo(() => values, [values]);

  useEffect(() => {
    setSelectedValue(defaultValue ?? (isMultiple ? [] : undefined));
  }, [defaultValue, isMultiple]);

  const isSelected = useCallback(
    (value: string) => {
      if (isMultiple) {
        return Array.isArray(selectedValue) && selectedValue.includes(value);
      }
      return selectedValue === value;
    },
    [isMultiple, selectedValue],
  );

  const handleChange = (value: string) => {
    if (isMultiple && Array.isArray(selectedValue)) {
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

  return (
    <SelectorWrapper>
      <Popup
        trigger={
          <SelectInput isMultiple={isMultiple} isOpen={isOpen}>
            {!selectedValue || !selectedValue.length ? (
              <Typography size="body" color={theme.content.weaker}>
                {placeholder ?? "Please select"}
              </Typography>
            ) : isMultiple ? (
              <SelectedItems>
                {Array.isArray(selectedValue) &&
                  selectedValue.map(value => (
                    <SelectedItem key={value}>
                      <Typography size="body" color={theme.content.main}>
                        {value}
                      </Typography>
                      <Button
                        iconButton
                        icon="close"
                        appearance="simple"
                        size="small"
                        onClick={e => handleUnselect(e, value)}
                      />
                    </SelectedItem>
                  ))}
              </SelectedItems>
            ) : (
              <Typography size="body">{selectedValue}</Typography>
            )}
            <Icon icon={isOpen ? "caretUp" : "caretDown"} color={theme.content.main} />
          </SelectInput>
        }
        open={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-start">
        <DropDownWrapper>
          {dropdownValues.map(item => (
            <DropDownItem
              key={item}
              isSelected={isSelected(item)}
              onClick={() => handleChange(item)}>
              <Typography size="body" color={theme.content.main}>
                {item}
              </Typography>
              {isSelected(item) && isMultiple && (
                <Icon icon="check" size="small" color={theme.content.main} />
              )}
            </DropDownItem>
          ))}
        </DropDownWrapper>
      </Popup>
    </SelectorWrapper>
  );
};

const SelectorWrapper = styled("div")(() => ({
  width: "100%",
}));

const SelectInput = styled("div")<{
  isMultiple?: boolean;
  isOpen?: boolean;
}>(({ isMultiple, isOpen, theme }) => ({
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
  cursor: "pointer",
}));

const SelectedItems = styled("div")<{}>(({ theme }) => ({
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

const DropDownWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.micro}px`,
  padding: `${theme.spacing.micro}px`,
  backgroundColor: `${theme.bg[1]}`,
  boxShadow: `${theme.shadow.popup}`,
  borderRadius: `${theme.radius.small}px`,
  border: "none",
}));

const DropDownItem = styled("div")<{
  isSelected?: boolean;
}>(({ isSelected, theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: `${theme.spacing.small}px`,
  backgroundColor: !isSelected ? `${theme.bg[1]}` : `${theme.select.weak} !important`,
  padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  borderRadius: `${theme.radius.smallest}px`,
  cursor: "pointer",
  ["&:hover"]: {
    backgroundColor: `${theme.bg[2]}`,
  },
}));

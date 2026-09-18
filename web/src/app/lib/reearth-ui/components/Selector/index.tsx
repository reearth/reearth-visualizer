import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import {
  FC,
  Fragment,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

import { Button } from "../Button";
import { Icon } from "../Icon";
import { Popup, PopupProps } from "../Popup";
import { Typography } from "../Typography";

export type SelectorOption = {
  value: string;
  label?: string;
  // Optional second line under the label, with an optional link to more detail.
  description?: string;
  descriptionLink?: string;
  // Options sharing a group are listed under a single heading, in the order
  // they appear in `options`.
  group?: string;
};

export type SelectorProps = {
  multiple?: boolean;
  value?: string | string[];
  options: SelectorOption[];
  disabled?: boolean;
  placeholder?: string;
  maxHeight?: number;
  size?: "normal" | "small";
  appearance?: "readonly";
  displayLabel?: string;
  onChange?: (value: string | string[]) => void;
  menuWidth?: number;
  menuPlacement?: PopupProps["placement"];
  // Replaces the default select box, for callers whose menu hangs off a plain
  // control — a text button, an icon — instead of a form field.
  trigger?: ReactNode;
  ariaLabel?: string;
  dataTestid?: string;
};

export const Selector: FC<SelectorProps> = ({
  multiple,
  value,
  options,
  size = "normal",
  appearance,
  placeholder,
  disabled,
  maxHeight,
  displayLabel,
  onChange,
  menuWidth,
  menuPlacement = "bottom-start",
  trigger,
  ariaLabel,
  dataTestid
}) => {
  const theme = useTheme();
  const t = useT();
  const selectorRef = useRef<HTMLDivElement>(null);
  const [selectedValue, setSelectedValue] = useState<
    string | string[] | undefined
  >(displayLabel ?? value ?? (multiple ? [] : undefined));

  useEffect(() => {
    if (displayLabel) {
      setSelectedValue(displayLabel);
    } else {
      setSelectedValue(value ?? (multiple ? [] : undefined));
    }
  }, [value, multiple, displayLabel]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectorWidth, setSelectorWidth] = useState<number>();

  // The menu grows past `maxHeight` once there are more options than fit, so
  // it gets the design's footer: a caret that pages the list down. The caret
  // dims at the end of the list rather than disappearing, so the menu keeps a
  // stable height.
  const [optionList, setOptionList] = useState<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState({
    isScrollable: false,
    isAtEnd: true
  });

  const syncScrollState = useCallback(() => {
    if (!optionList) return;
    const { scrollHeight, clientHeight, scrollTop } = optionList;
    const isScrollable = scrollHeight > clientHeight;
    // A pixel of slack: fractional layout sizes keep scrollTop just shy of the
    // true maximum even when the list is scrolled all the way down.
    const isAtEnd = scrollHeight - scrollTop - clientHeight <= 1;
    setScrollState((prev) =>
      prev.isScrollable === isScrollable && prev.isAtEnd === isAtEnd
        ? prev
        : { isScrollable, isAtEnd }
    );
  }, [optionList]);

  useEffect(() => {
    if (!optionList) {
      setScrollState({ isScrollable: false, isAtEnd: true });
      return;
    }
    // The menu is measured through a callback ref rather than on open, because
    // it mounts into a portal that floating-ui sizes and places over the next
    // few frames — measuring once on open reports a menu that does not overflow
    // yet, and the caret would only appear once the user scrolled. Observing
    // the list instead shows the caret as soon as the menu settles, and again
    // whenever it is resized.
    const observer = new ResizeObserver(syncScrollState);
    observer.observe(optionList);
    return () => observer.disconnect();
  }, [optionList, options, syncScrollState]);

  const handleScrollDown = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (!optionList) return;
      // Page down, keeping a little of the current view for continuity.
      optionList.scrollBy({
        top: optionList.clientHeight * 0.8,
        behavior: "smooth"
      });
    },
    [optionList]
  );

  const optionValues = useMemo(() => options, [options]);

  useEffect(() => {
    const selectorElement = selectorRef.current;
    if (!selectorElement) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      setSelectorWidth(width);
    });
    resizeObserver.observe(selectorElement);
    return () => {
      resizeObserver.unobserve(selectorElement);
      resizeObserver.disconnect();
    };
  }, []);

  const isSelected = useCallback(
    (value: string) => {
      if (multiple) {
        return Array.isArray(selectedValue) && selectedValue.includes(value);
      }
      return selectedValue === value;
    },
    [multiple, selectedValue]
  );

  const handleChange = (value: string) => {
    if (multiple && Array.isArray(selectedValue)) {
      if (selectedValue.includes(value)) {
        const newSelectedArr = selectedValue.filter((val) => val !== value);
        setSelectedValue(newSelectedArr);
        onChange?.(newSelectedArr);
      } else {
        const newSelectedArr = [...selectedValue, value];
        setSelectedValue(newSelectedArr);
        onChange?.(newSelectedArr);
      }
    } else {
      setIsOpen(!isOpen);
      if (value === selectedValue) return;
      setSelectedValue(value);
      onChange?.(value);
    }
  };

  const handleUnselect = useCallback(
    (e: MouseEvent<HTMLElement>, value: string | undefined) => {
      e.stopPropagation();
      if (value === undefined) return;
      if (Array.isArray(selectedValue) && selectedValue.length) {
        const newSelectedArr = selectedValue.filter((val) => val !== value);
        setSelectedValue(newSelectedArr);
        onChange?.(newSelectedArr);
      }
    },
    [selectedValue, onChange]
  );

  const selectedItems: SelectorOption[] = useMemo(() => {
    if (displayLabel) return [{ value: "__fixedLabel__", label: displayLabel }];
    if (Array.isArray(selectedValue)) {
      return selectedValue
        .map((val) => optionValues.find((item) => item.value === val))
        .filter((item): item is SelectorOption => !!item);
    }
    return [optionValues.find((item) => item.value === selectedValue)].filter(
      (item): item is SelectorOption => !!item
    );
  }, [optionValues, selectedValue, displayLabel]);

  const renderTrigger = () => {
    if (trigger) return trigger;
    return (
      <SelectInput
        size={size}
        isMultiple={multiple}
        isOpen={isOpen}
        disabled={disabled}
        width={selectorWidth}
        role="combobox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        data-testid={dataTestid || "select-input"}
      >
        {!selectedValue?.length ? (
          <Typography size="body" color={theme.content.weaker}>
            {placeholder ? placeholder : t("Please select")}
          </Typography>
        ) : multiple ? (
          <SelectedItems>
            {selectedItems.map((item) => (
              <SelectedItem key={item.value}>
                <Typography
                  size="body"
                  color={disabled ? theme.content.weaker : theme.content.main}
                >
                  {item.label}
                </Typography>
                {!disabled && (
                  <Button
                    iconButton
                    icon="close"
                    appearance="simple"
                    size="small"
                    onClick={(e: MouseEvent<HTMLElement>) =>
                      handleUnselect(e, item.value)
                    }
                  />
                )}
              </SelectedItem>
            ))}
          </SelectedItems>
        ) : (
          <Typography
            size="body"
            color={
              disabled && appearance !== "readonly"
                ? theme.content.weaker
                : theme.content.main
            }
          >
            {selectedItems[0]?.label}
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
    <SelectorWrapper ref={selectorRef} fitTrigger={!!trigger}>
      <Popup
        trigger={renderTrigger()}
        open={isOpen}
        onOpenChange={setIsOpen}
        disabled={disabled}
        placement={menuPlacement}
      >
        <DropDownWrapper
          maxHeight={maxHeight}
          width={menuWidth ?? selectorWidth}
        >
          <DropDownList
            ref={setOptionList}
            isScrollable={!!maxHeight}
            onScroll={syncScrollState}
          >
            {optionValues.length === 0 ? (
              <DropDownItem>
                <Typography size="body" color={theme.content.weaker}>
                  No Options yet
                </Typography>
              </DropDownItem>
            ) : (
              optionValues.map((item: SelectorOption, index: number) => {
                const startsGroup =
                  !!item.group && item.group !== optionValues[index - 1]?.group;
                return (
                  <Fragment key={item.value ?? ""}>
                    {startsGroup && (
                      <DropDownGroupLabel isFirst={index === 0}>
                        <Typography size="footnote" color={theme.content.weak}>
                          {item.group}
                        </Typography>
                      </DropDownGroupLabel>
                    )}
                    <DropDownItem
                      isSelected={isSelected(item.value)}
                      hasDescription={!!item.description}
                      onClick={() => handleChange(item.value)}
                      role="option"
                    >
                      <DropDownItemContent>
                        <Typography size="body" color={theme.content.main}>
                          {item.label ?? item.value}
                        </Typography>
                        {item.description && (
                          <Typography
                            size="footnote"
                            color={theme.content.weak}
                          >
                            {item.description}
                            {item.descriptionLink && (
                              <DropDownItemLink
                                href={item.descriptionLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t("Open in a new tab")}
                                // The link lives inside a clickable option, so
                                // opening it must not also select the option.
                                onClick={(e: MouseEvent<HTMLElement>) =>
                                  e.stopPropagation()
                                }
                              >
                                <Icon
                                  icon="arrowSquareOut"
                                  size="small"
                                  color={theme.primary.main}
                                />
                              </DropDownItemLink>
                            )}
                          </Typography>
                        )}
                      </DropDownItemContent>
                      {isSelected(item.value) && multiple && (
                        <Icon
                          icon="check"
                          size="small"
                          color={theme.content.main}
                        />
                      )}
                    </DropDownItem>
                  </Fragment>
                );
              })
            )}
          </DropDownList>
          {scrollState.isScrollable && (
            <DropDownScrollDown
              type="button"
              isAtEnd={scrollState.isAtEnd}
              disabled={scrollState.isAtEnd}
              onClick={handleScrollDown}
              aria-label={t("Scroll down")}
            >
              <Icon icon="caretDown" size="small" color={theme.content.weak} />
            </DropDownScrollDown>
          )}
        </DropDownWrapper>
      </Popup>
    </SelectorWrapper>
  );
};

const SelectorWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "fitTrigger"
})<{ fitTrigger?: boolean }>(({ fitTrigger }) => ({
  width: fitTrigger ? "fit-content" : "100%"
}));

const SelectInput = styled("div")<{
  isMultiple?: boolean;
  isOpen?: boolean;
  disabled?: boolean;
  width?: number;
  size: "normal" | "small";
}>(({ isMultiple, isOpen, disabled, width, size, theme }) => ({
  boxSizing: css.boxSizing.borderBox,
  backgroundColor: `${theme.bg[1]}`,
  display: css.display.flex,
  justifyContent: css.justifyContent.spaceBetween,
  alignItems: css.alignItems.center,
  gap: `${theme.spacing.small}px`,
  borderRadius: `${theme.radius.small}px`,
  border: `1px solid ${!disabled && isOpen ? theme.select.strong : theme.outline.weak}`,
  boxShadow: `${theme.shadow.input}`,
  padding:
    size === "small"
      ? `0 ${theme.spacing.smallest}px`
      : `${theme.spacing.smallest}px ${
          isMultiple ? theme.spacing.smallest : theme.spacing.small
        }px`,
  cursor: disabled ? "not-allowed" : "pointer",

  minWidth: width ? `${width}px` : "fit-content",
  height: size == "small" ? "21px" : "28px"
}));

const SelectedItems = styled("div")(({ theme }) => ({
  flex: 1,
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: `${theme.spacing.smallest}px`,
  flexWrap: "wrap"
}));

const SelectedItem = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: `${theme.spacing.smallest}px`,
  padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  backgroundColor: `${theme.bg[2]}`,
  borderRadius: `${theme.radius.smallest}px`
}));

const DropDownWrapper = styled("div")<{
  width?: number;
  maxHeight?: number;
}>(({ width, maxHeight, theme }) => ({
  boxSizing: css.boxSizing.borderBox,
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  backgroundColor: `${theme.bg[1]}`,
  boxShadow: `${theme.shadow.popup}`,
  borderRadius: `${theme.radius.small}px`,
  width: width ? `${width}px` : "",
  border: `1px solid ${theme.outline.weaker}`,
  maxHeight: maxHeight ? `${maxHeight}px` : "",
  // Keeps the scrolled list from painting over the rounded corners.
  overflow: "hidden"
}));

const DropDownList = styled("div")<{ isScrollable?: boolean }>(
  ({ isScrollable, theme }) => ({
    boxSizing: css.boxSizing.borderBox,
    display: css.display.flex,
    flexDirection: css.flexDirection.column,
    gap: `${theme.spacing.micro}px`,
    padding: `${theme.spacing.micro}px`,
    // `minHeight: 0` lets this shrink inside the flex column instead of
    // pushing the scroll-down footer out of the menu.
    minHeight: 0,
    overflowY: isScrollable ? "auto" : "hidden",
    ...theme.scrollBar
  })
);

const DropDownScrollDown = styled("button", {
  shouldForwardProp: (prop) => prop !== "isAtEnd"
})<{ isAtEnd?: boolean }>(({ isAtEnd, theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  flexShrink: 0,
  width: "100%",
  padding: `${theme.spacing.smallest}px 0`,
  border: "none",
  backgroundColor: `${theme.bg[1]}`,
  // Dimmed rather than removed at the end of the list, so the menu does not
  // change height as the user scrolls.
  opacity: isAtEnd ? 0.3 : 1,
  cursor: isAtEnd ? "default" : css.cursor.pointer,
  ["&:not(:disabled):hover"]: {
    backgroundColor: `${theme.bg[2]}`
  }
}));

const DropDownItem = styled("div")<{
  isSelected?: boolean;
  hasDescription?: boolean;
}>(({ isSelected, hasDescription, theme }) => ({
  display: css.display.flex,
  alignItems: hasDescription ? css.alignItems.flexStart : css.alignItems.center,
  justifyContent: css.justifyContent.spaceBetween,
  gap: `${theme.spacing.small}px`,
  backgroundColor: !isSelected
    ? `${theme.bg[1]}`
    : `${theme.select.weak} !important`,
  padding: hasDescription
    ? `${theme.spacing.smallest}px ${theme.spacing.small}px`
    : `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  borderRadius: `${theme.radius.smallest}px`,
  cursor: css.cursor.pointer,
  ["&:hover"]: {
    backgroundColor: `${theme.bg[2]}`
  }
}));

const DropDownItemContent = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: `${theme.spacing.micro}px`,
  minWidth: 0,
  // Descriptions run to several lines, so long unbroken tokens (URLs, license
  // ids) must wrap rather than widen the menu.
  p: {
    wordBreak: "break-word"
  }
}));

const DropDownItemLink = styled("a")(({ theme }) => ({
  display: css.display.inlineFlex,
  alignItems: css.alignItems.center,
  verticalAlign: "middle",
  marginLeft: `${theme.spacing.micro}px`
}));

const DropDownGroupLabel = styled("div")<{ isFirst?: boolean }>(
  ({ isFirst, theme }) => ({
    padding: `${theme.spacing.smallest}px ${theme.spacing.small}px ${theme.spacing.micro}px`,
    ...(!isFirst && {
      borderTop: `1px solid ${theme.outline.weaker}`,
      marginTop: `${theme.spacing.smallest}px`
    })
  })
);

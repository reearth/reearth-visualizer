import React, { useState, useRef, useCallback } from "react";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";
import { useMergeRefs } from "use-callback-ref";

import { styled, css, metrics } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

// Components

type OptionProps<Value extends string | number> = {
  value: Value;
  label: string;
  children?: React.ReactNode;
  focused?: boolean;
  selected?: boolean;
  inactive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
};

export type OptionElement<Value extends string | number> = React.ReactElement<OptionProps<Value>>;

export type Props<Value extends string | number> = {
  className?: string;
  value?: Value;
  inactive?: boolean;
  fullWidth?: boolean;
  onChange?: (value: Value) => void;
  options?: OptionElement<Value>[];
  ref?: React.Ref<HTMLDivElement>;
  selectComponent?: React.ReactNode;
};

const forwardRef = <Value extends string | number>(
  render: (props: Props<Value>, ref: React.Ref<HTMLDivElement>) => React.ReactElement | null,
): typeof SelectCore => React.forwardRef(render) as any;

const SelectCore = <Value extends string | number>(
  {
    className,
    value: selectedValue,
    inactive = false,
    fullWidth = false,
    onChange,
    selectComponent,
    options,
  }: Props<Value>,
  ref: React.Ref<HTMLDivElement>,
) => {
  const [open, setOpen] = useState(false);
  const [focusedValue, setFocusedValue] = useState(selectedValue);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const mergedRef = useMergeRefs(ref ? [ref, wrapperRef] : [wrapperRef]);
  const {
    styles,
    attributes,
    update: updatePopper,
  } = usePopper(wrapperRef.current, listRef.current, {
    placement: "bottom",
    modifiers: [
      {
        name: "flip",
        enabled: true,
        options: {
          fallbackPlacements: ["top"],
        },
      },
      {
        name: "offset",
        options: {
          offset: [0, 4],
        },
      },
      {
        name: "eventListeners",
        enabled: !open,
        options: {
          scroll: false,
          resize: false,
        },
      },
    ],
  });

  const values = options?.map(({ props: { value } }) => value);

  const openList = useCallback(() => {
    setOpen(true);
    listRef.current?.focus();
    updatePopper?.();
  }, [setOpen, updatePopper]);

  const closeList = useCallback(() => {
    setOpen(false);
    setFocusedValue(selectedValue);
    updatePopper?.();
  }, [setOpen, selectedValue, updatePopper]);

  const toggleList = useCallback(() => {
    if (open) {
      closeList();
    } else {
      openList();
    }
  }, [open, openList, closeList]);

  // Ref: https://github.com/mui-org/material-ui/blob/v4.9.3/packages/material-ui/src/Select/SelectInput.js#L152
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!inactive) {
        const validKeys = [
          " ",
          "ArrowUp",
          "ArrowDown",
          // The native select doesn't respond to enter on macOS, but it's recommended by
          // https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html
          "Enter",
        ];

        if (validKeys.indexOf(e.key) !== -1) {
          e.preventDefault();
          openList();
        }
      }
    },
    [inactive, openList],
  );

  // Ref:
  //   https://github.com/mui-org/material-ui/blob/v4.9.3/packages/material-ui/src/Menu/Menu.js#L74
  //   https://github.com/mui-org/material-ui/blob/v4.9.3/packages/material-ui/src/MenuList/MenuList.js
  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      const { key } = e;

      if (key === "Enter") {
        e.stopPropagation();
        if (focusedValue) {
          onChange?.(focusedValue);
        }
        return closeList();
      }

      if (key === "Tab" || key === "Escape") {
        e.preventDefault();
        return closeList();
      }

      const index = focusedValue && values ? values.indexOf(focusedValue) : 0;

      if (key === "ArrowDown") {
        const nextValue = values ? values[Math.min(values?.length - 1, index + 1)] : undefined;

        // Prevent scroll of the page
        e.preventDefault();
        return setFocusedValue(nextValue);
      }

      if (key === "ArrowUp") {
        const previousValue = values ? values[Math.max(0, index - 1)] : undefined;
        e.preventDefault();
        return setFocusedValue(previousValue);
      }
    },
    [closeList, focusedValue, values, onChange],
  );

  const handleListItemClick = useCallback(
    (value: Value, onClick: OptionProps<Value>["onClick"]) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!inactive) {
        onChange?.(value);
      }
      closeList();
      onClick?.(e);
    },
    [inactive, onChange, closeList],
  );

  const handleListItemMouseEnter = useCallback(
    (value: Value, onMouseEnter: OptionProps<Value>["onMouseEnter"]) => (e: React.MouseEvent) => {
      setFocusedValue(value);
      onMouseEnter?.(e);
    },
    [setFocusedValue],
  );

  useClickAway(mergedRef, closeList);

  return (
    <Wrapper
      className={className}
      ref={mergedRef}
      fullWidth={fullWidth}
      onClick={toggleList}
      onKeyDown={handleKeyDown}
      tabIndex={0}>
      <SelectWrapper>{selectComponent}</SelectWrapper>
      {!!options?.length && (
        <OptionList
          ref={listRef}
          open={open}
          fullWidth={fullWidth}
          onKeyDown={handleListKeyDown}
          tabIndex={0}
          style={styles.popper}
          {...attributes.popper}>
          {options.map(option => {
            const { value, onClick, onMouseEnter } = option.props;
            return React.cloneElement(option, {
              focused: value === focusedValue,
              selected: value === selectedValue,
              inactive,
              onClick: handleListItemClick(value, onClick),
              onMouseEnter: handleListItemMouseEnter(value, onMouseEnter),
            });
          })}
        </OptionList>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ fullWidth: boolean }>`
  position: relative;
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `};
  width: 100%;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

const SelectWrapper = styled.div`
  border: solid 1px ${props => props.theme.properties.border};
  background: ${props => props.theme.properties.bg};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${metricsSizes.xs}px;
  width: 100%;
  height: ${metrics.propertyTextInputHeight}px;
  box-sizing: border-box;
`;

const OptionList = styled.ul<{ fullWidth: boolean; open: boolean }>`
  ${({ open }) =>
    !open &&
    css`
      visibility: hidden;
      pointer-events: none;
    `}
  ${({ fullWidth }) =>
    fullWidth
      ? css`
          width: 100%;
        `
      : css`
          min-width: 200px;
        `};
  margin: 0;
  padding: 0;
  border: solid 1px ${props => props.theme.properties.border};
  border-radius: 3px;
  background: ${({ theme }) => theme.selectList.option.bg};
  box-sizing: border-box;
  overflow: hidden;
  z-index: ${props => props.theme.zIndexes.dropDown};

  &:focus {
    outline: none;
  }
`;

export default forwardRef(SelectCore);

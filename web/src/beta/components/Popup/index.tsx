import { ReactNode, RefObject, useEffect, useRef, useCallback } from "react";
import FocusLock from "react-focus-lock";
import { usePopper } from "react-popper";

import { styled, css } from "@reearth/services/theme";

const Popup: React.FC<{
  wrapperRef: RefObject<HTMLDivElement>;
  open: boolean;
  onClickAway?: () => void;
  onEscapeKeyDown?: () => void;
  children: ReactNode;
}> = ({ wrapperRef, open, onClickAway, onEscapeKeyDown, children }) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(wrapperRef.current, pickerRef.current, {
    placement: "bottom",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
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
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (open && pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClickAway?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open, onClickAway]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        onEscapeKeyDown?.();
      }
    },
    [onEscapeKeyDown],
  );

  return (
    <Wrapper
      ref={pickerRef}
      open={open}
      style={styles.popper}
      {...attributes.popper}
      onKeyDown={handleKeyDown}>
      <FocusLock disabled={!open}>{children}</FocusLock>
    </Wrapper>
  );
};

export default Popup;

const Wrapper = styled.div<{ open: boolean }>`
  ${({ open }) =>
    !open &&
    css`
      visibility: hidden;
      pointer-events: none;
    `}
`;

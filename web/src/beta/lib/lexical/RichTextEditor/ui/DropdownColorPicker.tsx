import { RefObject } from "react";

import ColorPicker from "./ColorPicker";
import DropDown from "./DropDown";

type Props = {
  containerRef: RefObject<HTMLDivElement>;
  scrollableContainerId?: string;
  disabled?: boolean;
  buttonAriaLabel?: string;
  buttonClassName: string;
  buttonIconClassName?: string;
  buttonLabel?: string;
  title?: string;
  stopCloseOnClickSelf?: boolean;
  color: string;
  onChange?: (color: string) => void;
};

export default function DropdownColorPicker({
  containerRef,
  scrollableContainerId,
  disabled = false,
  stopCloseOnClickSelf = true,
  color,
  onChange,
  ...rest
}: Props) {
  return (
    <DropDown
      {...rest}
      disabled={disabled}
      containerRef={containerRef}
      scrollableContainerId={scrollableContainerId}
      stopCloseOnClickSelf={stopCloseOnClickSelf}>
      <ColorPicker color={color} onChange={onChange} />
    </DropDown>
  );
}

import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

export type ToggleSize = "sm" | "md";

export type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: ToggleSize;
  disabled?: boolean;
};

const ToggleButton: React.FC<Props> = ({ checked, onChange, size = "md", disabled = false }) => {
  const handleClick = useCallback(
    () => !disabled && onChange(checked),
    [checked, onChange, disabled],
  );

  return (
    <Wrapper>
      <Switch size={size} checked={checked} disabled={disabled} onClick={handleClick}>
        <TopSlider size={size} checked={checked} />
      </Switch>
    </Wrapper>
  );
};

export default ToggleButton;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Switch = styled.label<{
  size: ToggleSize;
  checked: boolean;
  disabled: boolean;
}>`
  cursor: pointer;
  width: ${({ size }) => (size === "sm" ? "28px" : "40px")};
  height: ${({ size }) => (size === "sm" ? "14px" : "20px")};
  background: ${({ checked, theme }) => (checked ? theme.select.main : theme.secondary.main)};
  border: 1px solid ${({ checked, theme }) => (checked ? theme.select.main : theme.secondary.main)};
  border-radius: 12px;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.5)};
  transition: 0.4s;
`;

const TopSlider = styled.div<{
  size: ToggleSize;
  checked: boolean;
}>`
  width: ${({ size }) => (size === "sm" ? "14px" : "20px")};
  height: ${({ size }) => (size === "sm" ? "14px" : "20px")};
  background: ${({ theme }) => theme.content.withBackground};
  transition: 0.4s;
  border-radius: 50%;
  transform: ${({ checked }) => checked && "translateX(100%)"};
`;

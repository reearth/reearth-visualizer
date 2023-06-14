import type { FC } from "react";

import { styled, colors } from "@reearth/services/theme";

export type Props = {
  label: string;
  onClick?: () => void;
  selected?: boolean;
};

const TabButton: FC<Props> = ({ label, onClick, selected }) => {
  return (
    <Button onClick={onClick} disabled={selected}>
      {label}
    </Button>
  );
};

type ButtonProps = {
  disabled?: boolean;
};

const Button = styled.button<ButtonProps>`
  background: ${({ disabled }) => (disabled ? colors.dark.functional.select : "inherit")};
  padding: 8px 12px;
  height: 35px;
  border-radius: 4px 4px 0px 0px;
  :hover {
    background: ${colors.dark.functional.select};
    transition: all 0.5s ease;
  }
  color: ${({ disabled }) =>
    disabled ? colors.publish.dark.text.main : colors.publish.dark.text.weak};
  font-size: 14px;
  text-align: center;
`;

export default TabButton;

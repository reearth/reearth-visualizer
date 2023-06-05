import type { FC } from "react";

import { styled } from "@reearth/services/theme";

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
  background: ${({ disabled }) => (disabled ? "#232226" : "inherit")};
  padding: 8px 12px;
  height: 35px;
  border-radius: 4px;
  :hover {
    background: #232226;
    transition: all 0.5s ease;
  }
  color: ${({ disabled }) => (disabled ? "#C7C5C5" : "#4A4A4A")};
  font-family: "Noto Sans";
  font-size: 14px;
  text-align: center;
`;

export default TabButton;

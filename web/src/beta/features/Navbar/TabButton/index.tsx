import type { FC } from "react";

import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

export type Props = {
  label: string;
  onClick?: () => void;
  selected?: boolean;
};

const TabButton: FC<Props> = ({ label, onClick, selected }) => {
  return (
    <Button onClick={onClick} selected={selected} disabled={selected}>
      <Text size="body" weight="bold" customColor>
        {label}
      </Text>
    </Button>
  );
};

type ButtonProps = {
  selected?: boolean;
};

const Button = styled.button<ButtonProps>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 4px;
  color: ${({ selected, theme }) =>
    selected ? theme.general.content.main : theme.general.content.weak};
  background: ${({ selected, theme }) => (selected ? theme.general.bg.weak : theme.navbar.bg.main)};
  line-height: 19px;

  :hover {
    background: ${({ theme }) => theme.general.bg.weak};
    transition: all 0.5s ease;
    ${({ selected }) => selected && "cursor: default;"}
  }
`;

export default TabButton;

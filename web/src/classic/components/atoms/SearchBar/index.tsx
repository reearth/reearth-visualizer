import React from "react";

import { fonts } from "@reearth/classic/theme";
import { styled, useTheme } from "@reearth/services/theme";

import Box from "../Box";
import Flex from "../Flex";
import Icon from "../Icon";

export type Props = {
  className?: string;
  placeHolder?: string;
  onChange?: (e: string) => void;
  value?: string;
  iconPos?: "left" | "right";
};

const SearchBar: React.FC<Props> = ({
  className,
  placeHolder,
  onChange,
  value,
  iconPos = "right",
}) => {
  const theme = useTheme();
  return (
    <Box border={`solid 1px ${theme.classic.main.border}`} ph="m">
      <Flex className={className} align="center">
        {iconPos === "left" && <Icon icon="search" size={20} color={theme.classic.main.text} />}
        <StyledInput
          placeholder={placeHolder}
          value={value}
          onChange={e => onChange?.(e.currentTarget.value)}
        />
        {iconPos === "right" && <Icon icon="search" color={theme.classic.main.text} size={20} />}
      </Flex>
    </Box>
  );
};

const StyledInput = styled.input`
  border: none;
  font-size: ${fonts.sizes.m}px;
  padding: ${({ theme }) => `${theme.classic.metrics.s}px ${theme.classic.metrics["2xs"]}px`};
  background-color: inherit;
  color: ${({ theme }) => theme.classic.main.text};
  &:focus {
    border: none;
    outline: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.classic.main.weak};
  }
`;

export default SearchBar;

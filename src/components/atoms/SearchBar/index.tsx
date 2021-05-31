import { fonts, styled, useTheme } from "@reearth/theme";
import React from "react";
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
    <Box border={`solid 1px ${theme.colors.outline.weak}`} ph="m">
      <Flex className={className} align="center">
        {iconPos === "left" && <Icon icon="search" size={20} color={theme.colors.text.main} />}
        <StyledInput
          placeholder={placeHolder}
          value={value}
          onChange={e => onChange?.(e.currentTarget.value)}
        />
        {iconPos === "right" && <Icon icon="search" size={20} />}
      </Flex>
    </Box>
  );
};

const StyledInput = styled.input`
  border: none;
  font-size: ${fonts.sizes.m}px;
  padding: ${({ theme }) => `${theme.metrics.s}px ${theme.metrics["2xs"]}px`};
  background-color: inherit;
  color: ${({ theme }) => theme.colors.text.main};
  &:focus {
    border: none;
    outline: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.colors.text.weak};
  }
`;

export default SearchBar;

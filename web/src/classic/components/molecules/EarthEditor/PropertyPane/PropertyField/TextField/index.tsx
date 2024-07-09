import React from "react";

import TextBox from "@reearth/beta/components/TextBox";
import Text from "@reearth/classic/components/atoms/Text";
import { styled, useTheme } from "@reearth/services/theme";

import { FieldProps } from "../types";

export type Props = FieldProps<string> & {
  className?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  multiline?: boolean;
  onClick?: () => void;
};

const TextField: React.FC<Props> = ({
  className,
  name,
  value,
  placeholder,
  prefix,
  suffix,
  multiline,
  linked,
  overridden,
  onChange,
  onClick,
}) => {
  const theme = useTheme();
  const color = overridden
    ? theme.classic.main.warning
    : linked
      ? theme.classic.main.link
      : undefined;

  return (
    <Wrapper className={className} onClick={onClick}>
      <TextBox
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        multiline={multiline}
        prefix={prefix}
        suffix={suffix}
        color={color}
      />
      {name && <Text size="xs">{name}</Text>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

export default TextField;

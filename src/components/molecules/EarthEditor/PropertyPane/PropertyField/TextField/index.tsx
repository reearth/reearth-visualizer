import React from "react";

import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { styled, useTheme } from "@reearth/theme";

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
  const color = overridden ? theme.main.warning : linked ? theme.main.link : undefined;

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

import React from "react";

import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import { styled, useTheme } from "@reearth/services/theme";

type Props = {
  subMessage?: string;
  value: string;
  disabled?: boolean;
  link?: boolean;
  button1: string;
  button2?: string;
  actioned?: boolean;
  onButtonClick1: (e: React.MouseEvent<HTMLSpanElement>) => void;
  onButtonClick2?: (e: React.MouseEvent<HTMLSpanElement>) => void;
};
const InputField: React.FC<Props> = ({
  value,
  disabled = false,
  link,
  subMessage,
  button1,
  button2,
  actioned,
  onButtonClick1,
  onButtonClick2,
}) => {
  const theme = useTheme();
  return (
    <Wrapper>
      <InputContent>
        {link ? (
          <URL disabled={disabled} href={value} rel="noopener noreferrer" target="_blank">
            {value}
          </URL>
        ) : (
          <InputURL disabled={disabled} value={value} readOnly />
        )}
        <InputLinkButton onClick={onButtonClick1}>{actioned ? null : button1}</InputLinkButton>
        <InputLinkButton onClick={onButtonClick2}>
          {actioned ? <Icon icon="check" size={15} /> : button2}
        </InputLinkButton>
      </InputContent>
      <SubMessage size="2xs" color={theme.classic.main.weak}>
        {subMessage}
      </SubMessage>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-bottom: 20px;
`;

const InputContent = styled.div`
  padding: 5px;
  border: solid 1.5px ${props => props.theme.classic.main.border};
  text-align: left;
  height: auto;
  display: flex;
  align-items: center;
  font-size: ${fonts.sizes.s}px;
`;

const InputLinkButton = styled.button`
  border: none;
  flex: 0 0 auto;
  cursor: pointer;
  background: transparent;
  color: ${props => props.theme.classic.main.accent};
  padding: 5px 10px;
  > svg {
    font-size: 24px;
  }
`;

const InputURL = styled.input`
  flex: auto;
  border: none;
  outline: none;
  padding: 5px 10px;
  color: ${props => props.theme.classic.main.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${props => props.theme.classic.main.highlighted};
  text-decoration-line: underline;
`;

const URL = styled.a<{ disabled?: boolean }>`
  flex: auto;
  border: none;
  outline: none;
  padding: 5px 10px;
  color: ${props => props.theme.classic.main.accent};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration-line: underline;
`;

const SubMessage = styled(Text)`
  margin-top: 5px;
  > svg {
    font-size: 24px;
  }
`;

export default InputField;

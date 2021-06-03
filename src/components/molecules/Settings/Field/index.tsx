import React from "react";

import { styled, colors } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";

type Props = {
  className?: string;
  header?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
};

const Field: React.FC<Props> = ({ className, header, action, secondaryAction, body, children }) => {
  return (
    <Wrapper className={className}>
      {header && (
        <Header>
          <Text size="m">{header}</Text>
        </Header>
      )}
      <Content>{body ? body : children && children}</Content>
      <ActionArea>
        {secondaryAction && <Action>{secondaryAction}</Action>}
        {action && <Action>{action}</Action>}
      </ActionArea>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  color: ${colors.text.main};

  &:not(:last-child) {
    margin-bottom: 40px;
  }
`;

const ActionArea = styled.div`
  display: flex;
  align-content: center;
`;

const Header = styled.div`
  width: 220px;
  margin-right: 20px;
`;

const Content = styled.div`
  flex-grow: 1;
`;

const Action = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  margin-left: 25px;
`;

export default Field;

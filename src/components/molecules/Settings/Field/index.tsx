import React from "react";

import { styled } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes } from "@reearth/theme/metrics";

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
      <Content>{body ? <StyledText size="s">{body}</StyledText> : children && children}</Content>
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
  justify-content: space-between;
  justify-items: center;
  color: ${props => props.theme.main.text};
  &:not(:last-child) {
    margin-bottom: ${metricsSizes["2xl"]}px;
  }
`;

const Header = styled.div`
  width: 216px;
`;

const Content = styled.div`
  flex: 1;
`;

const StyledText = styled(Text)`
  max-height: 264px;
  overflow: auto;
`;

const ActionArea = styled.div`
  display: flex;
  align-content: flex-end;
  align-items: flex-start;
`;

const Action = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export default Field;

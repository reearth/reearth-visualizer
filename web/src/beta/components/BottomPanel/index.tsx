import React, { ReactNode, useState, CSSProperties } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

type BottomPanelContent = {
  id: string;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  hide?: boolean;
  maxHeight?: CSSProperties["maxHeight"];
};

type Props = {
  contents: BottomPanelContent[];
};

const BottomPanel: React.FC<Props> = ({ contents }) => {
  return (
    <Wrapper>
      {contents.map(
        content =>
          !content.hide && (
            <Section key={content.id} maxHeight={content.maxHeight}>
              <CollapsibleCard title={content.title}>
                {content.actions && <ActionArea>{content.actions}</ActionArea>}
                <Content hasActions={!!content.actions}>{content.children}</Content>
              </CollapsibleCard>
            </Section>
          ),
      )}
    </Wrapper>
  );
};

export default BottomPanel;

// Styled Components
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  gap: 4px;
  padding: 2px 4px;
`;

const Section = styled.div<{ maxHeight?: CSSProperties["maxHeight"] }>`
  flex-grow: 1;
  height: 100%;
  ${({ maxHeight }) => maxHeight && `max-height: ${maxHeight};`}
`;

const Card = styled.div`
  background: ${({ theme }) => theme.bg[0]};
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  background: ${({ theme }) => theme.bg[2]};
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const ActionArea = styled.div`
  padding: 8px;
`;

const Content = styled.div<{ hasActions?: boolean }>`
  padding: ${({ hasActions }) => (hasActions ? "0" : "8px 4px")};
  overflow-y: auto;
  flex-grow: 1;
`;

const ArrowIcon = styled(Icon)<{ opened: boolean }>`
  transform: rotate(${props => (props.opened ? 90 : -180)}deg);
  transition: all 0.2s;
`;

const CollapsibleCard: React.FC<{
  title?: ReactNode;
  children?: ReactNode;
}> = ({ title, children }) => {
  const theme = useTheme();
  const [opened, setOpened] = useState(true);

  return (
    <Card>
      {title && (
        <Title onClick={() => setOpened(!opened)}>
          <Text size="body" color={theme.content.main}>
            {title}
          </Text>
          <ArrowIcon icon="arrowToggle" size={12} color={theme.content.main} opened={opened} />
        </Title>
      )}
      {opened && children && <Content>{children}</Content>}
    </Card>
  );
};

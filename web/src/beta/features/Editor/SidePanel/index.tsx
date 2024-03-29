import { CSSProperties, ReactNode } from "react";

import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

export type SidePanelContent = {
  id: string;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  hide?: boolean;
  maxHeight?: CSSProperties["maxHeight"];
};

type Props = {
  location: "left" | "right";
  contents: SidePanelContent[];
  padding?: number;
};

const Panel: React.FC<Props> = ({ location, contents, padding }) => {
  return (
    <Wrapper location={location}>
      {contents.map(
        content =>
          !content.hide && (
            <Section key={content.id} maxHeight={content.maxHeight}>
              <Card>
                <Title size="body">{content.title}</Title>
                {content.actions && <ActionArea>{content.actions}</ActionArea>}
                <Content padding={padding}>{content.children}</Content>
              </Card>
            </Section>
          ),
      )}
    </Wrapper>
  );
};

export default Panel;

const Wrapper = styled.div<{ location: "left" | "right" }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 4px;
  box-sizing: border-box;
  padding: 2px 1px;
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

const Title = styled(Text)`
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  background: ${({ theme }) => theme.bg[2]};
  padding: 4px 12px;
`;

const ActionArea = styled.div`
  padding: 8px;
`;

const Content = styled.div<{ padding?: number }>`
  ${({ padding }) => padding && `padding: ${padding}px;`}

  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  overflow-y: auto;
  flex-grow: 1;
  height: 0;
  ::-webkit-scrollbar {
    display: none;
  }
`;

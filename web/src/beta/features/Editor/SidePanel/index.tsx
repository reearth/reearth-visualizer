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
};

const SidePanel: React.FC<Props> = ({ location, contents }) => {
  return (
    <Wrapper location={location}>
      {contents.map(
        content =>
          !content.hide && (
            <Section key={content.id} maxHeight={content.maxHeight}>
              <Card>
                <Title size="body">{content.title}</Title>
                {content.actions && <ActionArea>{content.actions}</ActionArea>}
                <Content hasActions={!!content.actions}>{content.children}</Content>
              </Card>
            </Section>
          ),
      )}
    </Wrapper>
  );
};

export default SidePanel;

const Wrapper = styled.div<{ location: "left" | "right" }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  gap: 4px;
  padding: 2px 4px;

  // for Resizable gutter width
  ${({ location }) => location === "left" && `padding-right: 0;`}
  ${({ location }) => location === "right" && `padding-left: 0;`}
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
  background: ${({ theme }) => theme.bg[2]};
  padding: 4px 8px;
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
`;

const ActionArea = styled.div`
  padding: 8px;
`;

const Content = styled.div<{ hasActions?: boolean }>`
  box-sizing: border-box;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  overflow-y: auto;
  flex-grow: 1;
  height: 0;
  ::-webkit-scrollbar {
    display: none;
  }
`;

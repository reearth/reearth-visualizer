import { ReactNode } from "react";

import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

export type BottomPanelContent = {
  id: string;
  title: ReactNode;
  children: ReactNode;
};

type Props = {
  content: BottomPanelContent;
};

const BottomPanel: React.FC<Props> = ({ content }) => {
  return (
    <Wrapper>
      {content.title && (
        <TitleWrapper>
          <Text size="footnote">{content.title}</Text>
        </TitleWrapper>
      )}
      <ContentWrapper>{content.children}</ContentWrapper>
    </Wrapper>
  );
};

export default BottomPanel;

const Wrapper = styled.div`
  height: 100%;
  border-left: 1px solid ${({ theme }) => theme.outline.weakest};
  border-right: 1px solid ${({ theme }) => theme.outline.weakest};
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  background: ${({ theme }) => theme.bg[2]};
`;

const ContentWrapper = styled.div`
  height: calc(100% - 28px);
`;

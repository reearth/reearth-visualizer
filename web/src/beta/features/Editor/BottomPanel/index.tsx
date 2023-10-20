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
`;

const TitleWrapper = styled.div`
  padding: 4px 8px;
  border-radius: 4px 4px 0 0;
  background: ${({ theme }) => theme.bg[2]};
`;

const ContentWrapper = styled.div`
  height: calc(100% - 28px);
`;

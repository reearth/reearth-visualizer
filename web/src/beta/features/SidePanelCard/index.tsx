import type { PropsWithChildren } from "react";

import { styled, useTheme, Theme } from "@reearth/services/theme";

type Props = {
  title: string;
};

const SidePanelCard: React.FC<PropsWithChildren<Props>> = ({ title, children }) => {
  const theme = useTheme();

  return (
    <Wrapper theme={theme}>
      <Title theme={theme}>{title}</Title>
      <Content>{children}</Content>
    </Wrapper>
  );
};

export default SidePanelCard;

const Wrapper = styled.div<{ theme: Theme }>`
  background: ${({ theme }) => theme.leftMenu.bg};
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div<{ theme: Theme }>`
  background: ${({ theme }) => theme.leftMenu.bgTitle};
  padding: 8px;
  font-weight: 500;
  font-size: 12px;
  line-height: 1.34;
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
`;

const Content = styled.div`
  padding: 8px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  overflow-y: auto;
  flex-grow: 1;
  height: 0;
  ::-webkit-scrollbar {
    display: none;
  }
`;

import React, { CSSProperties, ReactNode } from "react";

import { styled } from "@reearth/services/theme";

export type SidePanelContent = {
  id: string;
  title: ReactNode;
  children: ReactNode;
  maxHeight?: CSSProperties["maxHeight"];
};
type Props = {
  location: "left" | "right";
  contents: SidePanelContent[];
};

const SidePanel: React.FC<Props> = ({ location, contents }) => {
  return (
    <Wrapper location={location}>
      {contents.map(content => (
        <Item maxHeight={content.maxHeight} key={content.id}>
          <Card>
            <CardTitle>{content.title}</CardTitle>
            <CardContent>{content.children}</CardContent>
          </Card>
        </Item>
      ))}
    </Wrapper>
  );
};

export default SidePanel;

const Wrapper = styled.div<Pick<Props, "location">>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  gap: 4px;
  padding: 4px;

  // for Resizable gutter width
  ${({ location }) => location === "left" && `padding-right: 0;`}
  ${({ location }) => location === "right" && `padding-left: 0;`}
`;

const Item = styled.div<{ maxHeight?: CSSProperties["maxHeight"] }>`
  flex-grow: 1;
  height: 100%;
  ${({ maxHeight }) => maxHeight && `max-height: ${maxHeight};`}
`;

const Card = styled.div`
  background: ${({ theme }) => theme.leftMenu.bg};
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.div`
  background: ${({ theme }) => theme.leftMenu.bgTitle};
  padding: 8px;
  font-weight: 500;
  font-size: 12px;
  line-height: 1.34;
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
`;

const CardContent = styled.div`
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

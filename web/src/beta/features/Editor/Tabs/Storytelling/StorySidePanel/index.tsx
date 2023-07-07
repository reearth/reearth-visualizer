import { FC } from "react";
import StorySidePanelAction from "src/beta/features/Editor/Tabs/Storytelling/StorySidePanelAction";

import * as SidePanel from "@reearth/beta/features/Editor/SidePanel";
import StorySidePanelItem from "@reearth/beta/features/Editor/Tabs/Storytelling/StorySidePanelItem";
import { styled } from "@reearth/services/theme";

// TODO: these are currently rough definition
type Props = {
  stories: any;
  selectedStory: any;
  onSelectStory: (id: string) => void;
  onStoryAdd: () => void;
  selectedPageId?: string;
  onSelectPage: (id: string) => void;
  onPageAdd: () => void;
};

const StorySidePanel: FC<Props> = ({ onStoryAdd, onSelectStory, onPageAdd, onSelectPage }) => {
  return (
    <SidePanel.Wrapper location="left">
      <SidePanel.Section maxHeight="33%">
        <SidePanel.Card>
          <SidePanel.Title>Story</SidePanel.Title>
          <SidePanel.Content>
            <ContentInner>
              <ContentUp>
                {[...Array(100)].map((_, i) => (
                  <StorySidePanelItem key={i} onItemClick={() => onSelectStory(i.toString())}>
                    Story{i} Story{i} Story{i} Story{i} Story{i} Story{i} Story{i}
                  </StorySidePanelItem>
                ))}
              </ContentUp>
              <ContentBottom>
                <StorySidePanelAction icon="square" title="+ New Story" onClick={onStoryAdd} />
              </ContentBottom>
            </ContentInner>
          </SidePanel.Content>
        </SidePanel.Card>
      </SidePanel.Section>
      <SidePanel.Section>
        <SidePanel.Card>
          <SidePanel.Title>Pages</SidePanel.Title>
          <SidePanel.Content>
            <ContentInner>
              <ContentUp>
                {[...Array(100)].map((_, i) => (
                  <StorySidePanelItem key={i} onItemClick={() => onSelectPage(i.toString())}>
                    Page{i}
                  </StorySidePanelItem>
                ))}
              </ContentUp>
              <ContentBottom>
                <StorySidePanelAction icon="square" title="+ New Page" onClick={onPageAdd} />
                <StorySidePanelAction icon="square" title="+ New Swipe" onClick={onPageAdd} />
              </ContentBottom>
            </ContentInner>
          </SidePanel.Content>
        </SidePanel.Card>
      </SidePanel.Section>
    </SidePanel.Wrapper>
  );
};

export default StorySidePanel;

const ContentInner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ContentUp = styled.div`
  flex-grow: 1;
  height: 0;
  overflow-y: auto;
  ::-webkit-scrollbar {
    display: none;
  }

  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
`;

const ContentBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
`;

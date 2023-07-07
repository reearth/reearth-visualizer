import { FC } from "react";
import ActionItem from "src/beta/features/Editor/Tabs/Storytelling/StorySidePanelAction";

import {
  SidePanelCard,
  SidePanelCardContent,
  SidePanelCardTitle,
  SidePanelItem,
  SidePanelWrapper,
} from "@reearth/beta/features/Editor/SidePanel";
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

const StorySidePanel: FC<Props> = () => {
  return (
    <SidePanelWrapper location="left">
      <SidePanelItem maxHeight="33%">
        <SidePanelCard>
          <SidePanelCardTitle>Story</SidePanelCardTitle>
          <SidePanelCardContent>
            <ContentInner>
              <ContentUp>
                {[...Array(100)].map((_, i) => (
                  <StorySidePanelItem key={i}>
                    Story{i} Story{i} Story{i} Story{i} Story{i} Story{i} Story{i}
                  </StorySidePanelItem>
                ))}
              </ContentUp>
              <ContentBottom>
                <ActionItem icon="square" title="+ New Story" />
              </ContentBottom>
            </ContentInner>
          </SidePanelCardContent>
        </SidePanelCard>
      </SidePanelItem>
      <SidePanelItem>
        <SidePanelCard>
          <SidePanelCardTitle>Pages</SidePanelCardTitle>
          <SidePanelCardContent>
            <ContentInner>
              <ContentUp>
                {[...Array(100)].map((_, i) => (
                  <StorySidePanelItem key={i}>
                    Page{i} Page{i} Page{i} Page{i} Page{i} Page{i} Page{i}
                  </StorySidePanelItem>
                ))}
              </ContentUp>
              <ContentBottom>
                <ActionItem icon="square" title="+ New Page" />
                <ActionItem icon="square" title="+ New Swipe" />
              </ContentBottom>
            </ContentInner>
          </SidePanelCardContent>
        </SidePanelCard>
      </SidePanelItem>
    </SidePanelWrapper>
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
  padding-bottom: 8px;
`;

const ContentBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

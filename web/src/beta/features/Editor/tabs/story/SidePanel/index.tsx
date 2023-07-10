import { FC } from "react";

import * as StyledSidePanel from "@reearth/beta/features/Editor/SidePanel";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import PageItemWrapper from "./PageItemWrapper";
import RowAction from "./RowAction";
import RowItem from "./RowItem";

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

const SidePanel: FC<Props> = ({ onStoryAdd, onSelectStory, onPageAdd, onSelectPage }) => {
  const t = useT();
  return (
    <StyledSidePanel.Wrapper location="left">
      <StyledSidePanel.Section maxHeight="33%">
        <StyledSidePanel.Card>
          <StyledSidePanel.Title>{t("Story")}</StyledSidePanel.Title>
          <StyledSidePanel.Content>
            <ContentInner>
              <ContentUp>
                {[...Array(100)].map((_, i) => (
                  <RowItem
                    key={i}
                    onItemClick={() => onSelectStory(i.toString())}
                    onActionClick={() => console.log("onActionClick")}>
                    Story{i} / Story{i} / Story{i} / Story{i} / Story{i} / Story{i} / Story{i} /
                    Story{i} / Story{i}
                  </RowItem>
                ))}
              </ContentUp>
              <ContentBottom>
                <RowAction
                  icon="book"
                  iconColor="#ffffff"
                  iconSize={16}
                  title={`+ ${t("New Story")}`}
                  onClick={onStoryAdd}
                />
              </ContentBottom>
            </ContentInner>
          </StyledSidePanel.Content>
        </StyledSidePanel.Card>
      </StyledSidePanel.Section>
      <StyledSidePanel.Section>
        <StyledSidePanel.Card>
          <StyledSidePanel.Title>{t("Page")}</StyledSidePanel.Title>
          <StyledSidePanel.Content>
            <ContentInner>
              <ContentUp>
                {[...Array(100)].map((_, i) => (
                  <PageItemWrapper key={i} pageCount={i + 1} isSwipable={i % 2 === 0}>
                    <RowItem
                      key={i}
                      onItemClick={() => onSelectPage(i.toString())}
                      onActionClick={() => console.log("onActionClick")}>
                      Page
                    </RowItem>
                  </PageItemWrapper>
                ))}
              </ContentUp>
              <ContentBottom>
                <RowAction icon="square" title={`+ ${t("New Page")}`} onClick={onPageAdd} />
                <RowAction icon="swiper" title={`+ ${t("New Swipe")}`} onClick={onPageAdd} />
              </ContentBottom>
            </ContentInner>
          </StyledSidePanel.Content>
        </StyledSidePanel.Card>
      </StyledSidePanel.Section>
    </StyledSidePanel.Wrapper>
  );
};

export default SidePanel;

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

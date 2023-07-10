import { FC, useMemo } from "react";

import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Action from "./Action";
import Item from "./Item";
import PageItemWrapper from "./PageItemWrapper";

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

  const StoryContent = useMemo(() => {
    return (
      <ContentInner>
        <ContentUp>
          {[...Array(100)].map((_, i) => (
            <Item
              key={i}
              onItemClick={() => onSelectStory(i.toString())}
              onActionClick={() => console.log("onActionClick")}>
              Story{i} / Story{i} / Story{i} / Story{i} / Story{i} / Story{i} / Story{i} / Story{i}{" "}
              / Story{i}
            </Item>
          ))}
        </ContentUp>
        <ContentBottom>
          <Action
            icon="book"
            iconColor="#ffffff"
            iconSize={16}
            title={`+ ${t("New Story")}`}
            onClick={onStoryAdd}
          />
        </ContentBottom>
      </ContentInner>
    );
  }, [onSelectStory, onStoryAdd, t]);

  const PageContent = useMemo(() => {
    return (
      <ContentInner>
        <ContentUp>
          {[...Array(100)].map((_, i) => (
            <PageItemWrapper key={i} pageCount={i + 1} isSwipable={i % 2 === 0}>
              <Item
                key={i}
                onItemClick={() => onSelectPage(i.toString())}
                onActionClick={() => console.log("onActionClick")}>
                Page
              </Item>
            </PageItemWrapper>
          ))}
        </ContentUp>
        <ContentBottom>
          <Action icon="square" title={`+ ${t("New Page")}`} onClick={onPageAdd} />
          <Action icon="swiper" title={`+ ${t("New Swipe")}`} onClick={onPageAdd} />
        </ContentBottom>
      </ContentInner>
    );
  }, [onPageAdd, onSelectPage, t]);

  return (
    <SidePanelCommon
      location="left"
      contents={[
        {
          id: "story",
          title: t("Story"),
          maxHeight: "33%",
          children: StoryContent,
        },
        {
          id: "page",
          title: t("Page"),
          children: PageContent,
        },
      ]}
    />
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

import { useState } from "react";

import DragAndDropList from "@reearth/beta/components/DragAndDropList";
import ListItem from "@reearth/beta/components/ListItem";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Action from "@reearth/beta/features/Editor/tabs/story/SidePanel/Action";
import PageItemWrapper from "@reearth/beta/features/Editor/tabs/story/SidePanel/PageItemWrapper";
import { StoryPageFragmentFragment } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  storyPages: StoryPageFragmentFragment[];
  selectedPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
  onPageAdd: (isSwipeable: boolean) => void;
  onPageDuplicate: (id: string) => void;
  onPageDelete: (id: string) => void;
};
const ContentPage: React.FC<Props> = ({
  storyPages,
  selectedPage,
  onPageSelect,
  onPageAdd,
  onPageDuplicate,
  onPageDelete,
}) => {
  const t = useT();
  const [openedPageId, setOpenedPageId] = useState<string | undefined>(undefined);

  const [items, setItems] = useState(storyPages);
  return (
    <SContent>
      <SContentUp onScroll={openedPageId ? () => setOpenedPageId(undefined) : undefined}>
        <DragAndDropList
          uniqueKey="LeftPanelPages"
          gap={8}
          items={items}
          getId={item => item.id}
          onItemDrop={(item, index) => {
            setItems(old => {
              const items = [...old];
              items.splice(
                old.findIndex(o => o.id === item.id),
                1,
              );
              items.splice(index, 0, item);
              return items;
            });
          }}
          renderItem={(storyPage, i) => {
            return (
              <PageItemWrapper
                key={storyPage.id}
                pageCount={i + 1}
                isSwipeable={storyPage.swipeable}>
                <ListItem
                  key={i}
                  border
                  onItemClick={() => onPageSelect(storyPage.id)}
                  onActionClick={() => setOpenedPageId(old => (old ? undefined : storyPage.id))}
                  onOpenChange={isOpen => {
                    setOpenedPageId(isOpen ? storyPage.id : undefined);
                  }}
                  isSelected={selectedPage?.id === storyPage.id}
                  isOpenAction={openedPageId === storyPage.id}
                  actionContent={
                    <PopoverMenuContent
                      width="120px"
                      size="md"
                      items={[
                        {
                          icon: "copy",
                          name: "Duplicate",
                          onClick: () => {
                            setOpenedPageId(undefined);
                            onPageDuplicate(storyPage.id);
                          },
                        },
                        {
                          icon: "trash",
                          name: "Delete",
                          onClick: () => {
                            setOpenedPageId(undefined);
                            onPageDelete(storyPage.id);
                          },
                        },
                      ]}
                    />
                  }>
                  {storyPage.title}
                </ListItem>
              </PageItemWrapper>
            );
          }}
        />
      </SContentUp>
      <SContentBottom>
        <Action icon="square" title={`+ ${t("New Page")}`} onClick={() => onPageAdd(false)} />
        <Action icon="swiper" title={`+ ${t("New Swipe")}`} onClick={() => onPageAdd(true)} />
      </SContentBottom>
    </SContent>
  );
};

export default ContentPage;

const SContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SContentUp = styled.div`
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

const SContentBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
`;

import { useState } from "react";

import DragAndDropList from "@reearth/beta/components/DragAndDropList";
import ListItem from "@reearth/beta/components/ListItem";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Action from "@reearth/beta/features/Editor/Story/TempContentStory/Action";
import PageItemWrapper from "@reearth/beta/features/Editor/Story/TempContentStory/PageItemWrapper";
import { styled } from "@reearth/services/theme";

type Props = {
  onStorySelect: (id: string) => void;
  onStoryAdd: () => void;
  onStoryDelete: (id: string) => void;
  onStoryClickSettings: (id: string) => void;
  onStoryRename: (id: string) => void;
};

// !! NOTE !!
// This component is not in use
// Keeping it here for reference only

// This component is created for the multiple stories, currently this is hidden
// Need to replace text with i18n when use this
const ContentStory: React.FC<Props> = ({
  onStorySelect,
  onStoryAdd,
  onStoryDelete,
  onStoryClickSettings,
  onStoryRename,
}) => {
  const [openedPageId, setOpenedPageId] = useState<string | undefined>(undefined);
  const [items, setItems] = useState(
    [...Array(100)].map((_, i) => ({
      id: i.toString(),
      index: i,
      text: "page" + i,
    })),
  );
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
          renderItem={item => {
            return (
              <PageItemWrapper pageCount={item.index + 1} isSwipeable={item.index % 2 === 0}>
                <ListItem
                  border
                  onItemClick={() => onStorySelect(item.id)}
                  onActionClick={() => setOpenedPageId(old => (old ? undefined : item.id))}
                  onOpenChange={isOpen => {
                    setOpenedPageId(isOpen ? item.id : undefined);
                  }}
                  isSelected={item.index === 0}
                  isOpenAction={openedPageId === item.id}
                  actionContent={
                    <PopoverMenuContent
                      width="120px"
                      size="md"
                      items={[
                        {
                          icon: "pencilSimple",
                          name: "Rename",
                          onClick: () => {
                            setOpenedPageId(undefined);
                            onStoryRename(item.id);
                          },
                        },
                        {
                          icon: "gearSix",
                          name: "Settings",
                          onClick: () => {
                            setOpenedPageId(undefined);
                            onStoryClickSettings(item.id);
                          },
                        },
                        {
                          icon: "trash",
                          name: "Delete Story",
                          onClick: () => {
                            setOpenedPageId(undefined);
                            onStoryDelete(item.id);
                          },
                        },
                      ]}
                    />
                  }>
                  Page
                </ListItem>
              </PageItemWrapper>
            );
          }}
        />
        {[...Array(100)].map((_, i) => (
          <ListItem
            key={i}
            onItemClick={() => onStorySelect(i.toString())}
            onActionClick={() => setOpenedPageId(old => (old ? undefined : i.toString()))}
            onOpenChange={isOpen => {
              setOpenedPageId(isOpen ? i.toString() : undefined);
            }}
            isSelected={false}
            isOpenAction={openedPageId === i.toString()}
            actionContent={
              <PopoverMenuContent
                width="128px"
                size="md"
                items={[
                  {
                    icon: "pencilSimple",
                    name: "Rename",
                    onClick: () => {
                      setOpenedPageId(undefined);
                      onStoryRename(i.toString());
                    },
                  },
                  {
                    icon: "gearSix",
                    name: "Settings",
                    onClick: () => {
                      setOpenedPageId(undefined);
                      onStoryClickSettings(i.toString());
                    },
                  },
                  {
                    icon: "trash",
                    name: "Delete Story",
                    onClick: () => {
                      setOpenedPageId(undefined);
                      onStoryDelete(i.toString());
                    },
                  },
                ]}
              />
            }>
            Story
          </ListItem>
        ))}
      </SContentUp>
      <SContentBottom>
        <Action
          icon="book"
          iconColor="#ffffff"
          iconSize={16}
          title={`+ New Story`}
          onClick={onStoryAdd}
        />
      </SContentBottom>
    </SContent>
  );
};

export default ContentStory;

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

import { useState } from "react";

import DragAndDropList from "@reearth/beta/components/DragAndDropList";
import ListItem from "@reearth/beta/components/ListItem";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Action from "@reearth/beta/features/Editor/tabs/story/SidePanel/Action";
import PageItemWrapper from "@reearth/beta/features/Editor/tabs/story/SidePanel/PageItemWrapper";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  onPageSelect: (id: string) => void;
  onPageAdd: () => void;
  onPageDuplicate: (id: string) => void;
  onPageDelete: (id: string) => void;
};
const ContentPage: React.FC<Props> = ({
  onPageSelect,
  onPageAdd,
  onPageDuplicate,
  onPageDelete,
}) => {
  const t = useT();
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
              <PageItemWrapper pageCount={item.index + 1} isSwipable={item.index % 2 === 0}>
                <ListItem
                  border
                  onItemClick={() => onPageSelect(item.id)}
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
                          icon: "copy",
                          name: "Duplicate",
                          onClick: () => {
                            setOpenedPageId(undefined);
                            onPageDuplicate(item.id);
                          },
                        },
                        {
                          icon: "trash",
                          name: "Delete",
                          onClick: () => {
                            setOpenedPageId(undefined);
                            onPageDelete(item.id);
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
      </SContentUp>
      <SContentBottom>
        <Action icon="square" title={`+ ${t("New Page")}`} onClick={onPageAdd} />
        <Action icon="swiper" title={`+ ${t("New Swipe")}`} onClick={onPageAdd} />
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

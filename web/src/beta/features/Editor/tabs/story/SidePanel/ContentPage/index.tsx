import { useState } from "react";

import Item from "@reearth/beta/components/ListItem";
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

  return (
    <SContent>
      <SContentUp onScroll={openedPageId ? () => setOpenedPageId(undefined) : undefined}>
        {[...Array(100)].map((_, i) => (
          <PageItemWrapper key={i} pageCount={i + 1} isSwipable={i % 2 === 0}>
            <Item
              key={i}
              border
              onItemClick={() => onPageSelect(i.toString())}
              onActionClick={() => setOpenedPageId(old => (old ? undefined : i.toString()))}
              onOpenChange={isOpen => {
                setOpenedPageId(isOpen ? i.toString() : undefined);
              }}
              isSelected={i === 0}
              isOpenAction={openedPageId === i.toString()}
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
                        onPageDuplicate(i.toString());
                      },
                    },
                    {
                      icon: "trash",
                      name: "Delete",
                      onClick: () => {
                        setOpenedPageId(undefined);
                        onPageDelete(i.toString());
                      },
                    },
                  ]}
                />
              }>
              Page
            </Item>
          </PageItemWrapper>
        ))}
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

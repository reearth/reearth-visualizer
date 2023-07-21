import { useState } from "react";

import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Action from "@reearth/beta/features/Editor/tabs/story/SidePanel/Action";
import Item from "@reearth/beta/features/Editor/tabs/story/SidePanel/Item";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  onStorySelect: (id: string) => void;
  onStoryAdd: () => void;
  onStoryDelete: (id: string) => void;
  onStoryClickSettings: (id: string) => void;
  onStoryRename: (id: string) => void;
};
const ContentStory: React.FC<Props> = ({
  onStorySelect,
  onStoryAdd,
  onStoryDuplicate,
  onStoryDelete,
}) => {
  const t = useT();
  const [openedPageId, setOpenedPageId] = useState<string | undefined>(undefined);

  return (
    <SContent>
      <SContentUp onScroll={openedPageId ? () => setOpenedPageId(undefined) : undefined}>
        {[...Array(100)].map((_, i) => (
          <Item
            key={i}
            onItemClick={() => onStorySelect(i.toString())}
            onActionClick={() => setOpenedPageId(old => (old ? undefined : i.toString()))}
            onOpenChange={isOpen => {
              setOpenedPageId(isOpen ? i.toString() : undefined);
            }}
            isActive={false}
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
                      onStoryDuplicate(i.toString());
                    },
                  },
                  {
                    icon: "gearSix",
                    name: "Settings",
                    onClick: () => {
                      setOpenedPageId(undefined);
                      onStoryDelete(i.toString());
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
          </Item>
        ))}
      </SContentUp>
      <SContentBottom>
        <Action
          icon="book"
          iconColor="#ffffff"
          iconSize={16}
          title={`+ ${t("New Story")}`}
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

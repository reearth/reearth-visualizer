import { FC, useEffect, useState } from "react";

import DragAndDropList from "@reearth/beta/components/DragAndDropList";
import { getFieldValue } from "@reearth/beta/features/Visualizer/Crust/StoryPanel/utils";
import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { isEmptyString } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useStoryPage } from "../context";

import Action from "./Action";
import PageItem from "./PageItem";
import PageItemWrapper from "./PageItemWrapper";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const PagesPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
  const {
    storyPages,
    selectedStoryPage,
    handleStoryPageSelect,
    handleStoryPageAdd,
    handleStoryPageDelete,
    handleStoryPageMove,
    handlePropertyValueUpdate,
  } = useStoryPage();

  const t = useT();
  const [openedPageId, setOpenedPageId] = useState<string | undefined>(undefined);

  const [items, setItems] = useState(storyPages ?? []);

  useEffect(() => {
    setItems(storyPages ?? []);
  }, [storyPages]);

  return (
    <Panel
      title="Pages"
      extend
      alwaysOpen
      storageId="editor-story-pages-panel"
      showCollapseArea={showCollapseArea}
      areaRef={areaRef}>
      <SContent>
        <SContentUp onScroll={openedPageId ? () => setOpenedPageId(undefined) : undefined}>
          <DragAndDropList
            uniqueKey="LeftPanelPages"
            gap={8}
            items={items}
            getId={item => item.id}
            onItemDrop={async (item, index) => {
              setItems(old => {
                const items = [...old];
                items.splice(
                  old.findIndex(o => o.id === item.id),
                  1,
                );
                items.splice(index, 0, item);
                return items;
              });
              await handleStoryPageMove(item.id, index);
            }}
            renderItem={(storyPage, i) => {
              const title = (getFieldValue(storyPage.property.items ?? [], "title", "title") ??
                t("Untitled")) as string;
              const hasEmptySpace = isEmptyString(title);
              return (
                <PageItemWrapper
                  key={storyPage.id}
                  pageCount={i + 1}
                  isSwipeable={storyPage.swipeable}>
                  <PageItem
                    key={i}
                    isSelected={selectedStoryPage?.id === storyPage.id}
                    isOpenAction={openedPageId === storyPage.id}
                    onItemClick={() => handleStoryPageSelect(storyPage.id)}
                    onActionClick={() => setOpenedPageId(old => (old ? undefined : storyPage.id))}
                    onOpenChange={isOpen => {
                      setOpenedPageId(isOpen ? storyPage.id : undefined);
                    }}
                    onPageDelete={() => handleStoryPageDelete(storyPage.id)}
                    title={hasEmptySpace || !title ? t("Untitled") : title}
                    setOpenedPageId={setOpenedPageId}
                    propertyId={storyPage.property.id}
                    storyPage={storyPage}
                    onPropertyUpdate={handlePropertyValueUpdate}
                  />
                </PageItemWrapper>
              );
            }}
          />
        </SContentUp>
        <SContentBottom>
          <Action
            icon="square"
            title={`+ ${t("New Page")}`}
            onClick={() => handleStoryPageAdd(false)}
          />
          {/* <Action icon="swiper" title={`+ ${t("New Swipe")}`} onClick={() => onPageAdd(true)} /> */}
        </SContentBottom>
      </SContent>
    </Panel>
  );
};

export default PagesPanel;

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

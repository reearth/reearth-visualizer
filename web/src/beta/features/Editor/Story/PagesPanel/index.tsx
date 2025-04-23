import { Button, DragAndDropList } from "@reearth/beta/lib/reearth-ui";
import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { useStoryPage } from "../context";

import PageItem from "./PageItem";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;
const PAGES_DRAG_HANDLE_CLASS_NAME =
  "reearth-visualizer-editor-story-page-drag-handle";

const PagesPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
  const { storyPages, handleStoryPageAdd, handleStoryPageMove } =
    useStoryPage();

  const [openedPageId, setOpenedPageId] = useState<string | undefined>(
    undefined
  );

  const [isDragging, setIsDragging] = useState(false);
  const [storyPageitems, setStoryPageitems] = useState(storyPages ?? []);

  const DraggableStoryPageItems = useMemo(
    () =>
      storyPageitems?.map((storyPage, index) => ({
        id: storyPage.id,
        content: (
          <PageItem
            pageCount={index + 1}
            storyPage={storyPage}
            dragHandleClassName={PAGES_DRAG_HANDLE_CLASS_NAME}
            isDragging={isDragging}
          />
        )
      })),
    [storyPageitems, isDragging]
  );

  const handleMoveStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMoveEnd = useCallback(
    async (itemId?: string, newIndex?: number) => {
      if (itemId !== undefined && newIndex !== undefined) {
        setStoryPageitems((old) => {
          const items = [...old];
          const currentIndex = old.findIndex((o) => o.id === itemId);
          if (currentIndex !== -1) {
            const [movedItem] = items.splice(currentIndex, 1);
            items.splice(newIndex, 0, movedItem);
          }
          return items;
        });
        await handleStoryPageMove?.(itemId, newIndex);
      }
      setIsDragging(false);
    },
    [handleStoryPageMove]
  );

  useEffect(() => {
    setStoryPageitems(storyPages ?? []);
  }, [storyPages]);

  const t = useT();

  return (
    <Panel
      title={t("Pages")}
      extend
      alwaysOpen
      storageId="editor-story-pages-panel"
      dataTestid="editor-story-pages-panel"
      showCollapseArea={showCollapseArea}
      areaRef={areaRef}
    >
      <ButtonWrapper>
        <Button
          icon="plus"
          title={t("New Page")}
          size="small"
          extendWidth
          onClick={() => handleStoryPageAdd(false)}
        />
      </ButtonWrapper>
      <Wrapper
        onScroll={openedPageId ? () => setOpenedPageId(undefined) : undefined}
      >
        {!!DraggableStoryPageItems && (
          <DragAndDropList
            items={DraggableStoryPageItems}
            handleClassName={PAGES_DRAG_HANDLE_CLASS_NAME}
            onMoveEnd={handleMoveEnd}
            onMoveStart={handleMoveStart}
            dragDisabled={false}
          />
        )}
      </Wrapper>
    </Panel>
  );
};

export default PagesPanel;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  gap: theme.spacing.normal,
  overflowY: "auto",
  boxSizing: "border-box"
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.small}px 0`
}));

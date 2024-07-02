import { FC, useCallback, useMemo, useState } from "react";

import { Button, DragAndDropList } from "@reearth/beta/lib/reearth-ui";
import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { styled } from "@reearth/services/theme";

import { useStoryPage } from "../context";

import PageItem from "./PageItem";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;
const PAGES_DRAG_HANDLE_CLASS_NAME = "reearth-visualizer-editor-story-page-drag-handle";

const PagesPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
  const { storyPages, handleStoryPageAdd, handleStoryPageMove } = useStoryPage();

  const [openedPageId, setOpenedPageId] = useState<string | undefined>(undefined);

  const [isDragging, setIsDragging] = useState(false);

  const DraggableStoryPageItems = useMemo(
    () =>
      storyPages?.map((storyPage, index) => ({
        id: storyPage.id,
        content: (
          <PageItem
            pageCount={index + 1}
            storyPage={storyPage}
            dragHandleClassName={PAGES_DRAG_HANDLE_CLASS_NAME}
            isDragging={isDragging}
          />
        ),
      })),
    [storyPages, isDragging],
  );

  const handleMoveStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMoveEnd = useCallback(
    (itemId?: string, newIndex?: number) => {
      if (itemId !== undefined && newIndex !== undefined) {
        handleStoryPageMove?.(itemId, newIndex);
      }
      setIsDragging(false);
    },
    [handleStoryPageMove],
  );

  return (
    <Panel
      title="Pages"
      extend
      alwaysOpen
      storageId="editor-story-pages-panel"
      showCollapseArea={showCollapseArea}
      areaRef={areaRef}>
      <ButtonWrapper>
        <Button
          icon="plus"
          title="New Page"
          size="small"
          extendWidth
          onClick={() => handleStoryPageAdd(false)}
        />
      </ButtonWrapper>
      <Wrapper onScroll={openedPageId ? () => setOpenedPageId(undefined) : undefined}>
        <DragAndDropList
          items={DraggableStoryPageItems}
          handleClassName={PAGES_DRAG_HANDLE_CLASS_NAME}
          onMoveEnd={handleMoveEnd}
          onMoveStart={handleMoveStart}
          dragDisabled={false}
        />
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
  boxSizing: "border-box",
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.small}px 0`,
}));

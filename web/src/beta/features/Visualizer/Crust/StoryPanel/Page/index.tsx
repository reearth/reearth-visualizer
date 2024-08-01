import { FC, Fragment, MutableRefObject, ReactNode, useEffect, useMemo } from "react";

import BlockAddBar from "@reearth/beta/features/Visualizer/shared/components/BlockAddBar";
import ContentWrapper from "@reearth/beta/features/Visualizer/shared/components/ContentWrapper";
import SelectableArea from "@reearth/beta/features/Visualizer/shared/components/SelectableArea";
import { useElementOnScreen } from "@reearth/beta/features/Visualizer/shared/hooks/useElementOnScreen";
import { DragAndDropList } from "@reearth/beta/lib/reearth-ui";
import type { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import type { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { BlockProps } from "../../../shared/types";
import StoryBlock from "../Block";
import {
  STORY_PANEL_CONTENT_ELEMENT_ID,
  MIN_STORY_PAGE_PADDING_IN_EDITOR,
  MIN_STORY_PAGE_GAP_IN_EDITOR,
  STORY_PANEL_WIDTH,
} from "../constants";
import { StoryBlock as StoryBlockType } from "../types";

import useHooks, { type StoryPage } from "./hooks";

type Props = {
  page?: StoryPage;
  selectedPageId?: string;
  selectedStoryBlockId?: string;
  installableStoryBlocks?: InstallableStoryBlock[];
  showPageSettings?: boolean;
  isEditable?: boolean;
  isAutoScrolling?: MutableRefObject<boolean>;
  scrollTimeoutRef: MutableRefObject<NodeJS.Timeout | undefined>;
  children?: ReactNode;
  onCurrentPageChange?: (pageId: string, disableScrollIntoView?: boolean) => void;
  onPageSettingsToggle?: () => void;
  onPageSelect?: (pageId?: string | undefined) => void;
  onBlockCreate?: (
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void> | undefined;
  onBlockDelete?: (blockId?: string | undefined) => Promise<void> | undefined;
  onBlockSelect?: (blockId?: string) => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  onBlockMove?: (id: string, targetIndex: number, blockId: string) => void;
  onBlockDoubleClick?: (blockId?: string) => void;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
  renderBlock?: (block: BlockProps<StoryBlockType>) => ReactNode;
};
const PAGE_DRAG_HANDLE_CLASS_NAME = "reearth-visualizer-editor-page-drag-handle";

const StoryPanel: FC<Props> = ({
  page,
  selectedPageId,
  selectedStoryBlockId,
  installableStoryBlocks,
  showPageSettings,
  isEditable,
  scrollTimeoutRef,
  isAutoScrolling,
  children,
  onCurrentPageChange,
  onPageSettingsToggle,
  onPageSelect,
  onBlockCreate,
  onBlockDelete,
  onBlockSelect,
  onBlockDoubleClick,
  onBlockMove,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete,
  renderBlock,
}) => {
  const t = useT();

  const {
    openBlocksIndex,
    titleId,
    titleProperty,
    propertyId,
    panelSettings,
    storyBlocks,
    disableSelection,
    handleBlockOpen,
    handleBlockCreate,
    handleMoveEnd,
  } = useHooks({
    page,
    isEditable,
    onBlockCreate,
    onBlockMove,
  });

  const { containerRef, isIntersecting } = useElementOnScreen({
    root: document.getElementById(STORY_PANEL_CONTENT_ELEMENT_ID),
    threshold: 0.2,
  });

  useEffect(() => {
    if (isIntersecting) {
      const id = containerRef.current?.id;
      if (id) {
        if (isAutoScrolling?.current) {
          const wrapperElement = document.getElementById(STORY_PANEL_CONTENT_ELEMENT_ID);

          wrapperElement?.addEventListener("scroll", () => {
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(function () {
              isAutoScrolling.current = false;
            }, 100);
          });
        } else {
          onCurrentPageChange?.(id, true);
        }
      }
    }
  }, [isIntersecting, containerRef, isAutoScrolling, scrollTimeoutRef, onCurrentPageChange]);

  const DraggableStoryBlockItems = useMemo(
    () =>
      storyBlocks.map((b, idx) => ({
        id: b.id,
        content: (
          <Fragment>
            <StoryBlock
              block={b}
              pageId={page?.id}
              isSelected={selectedStoryBlockId === b.id}
              isEditable={isEditable}
              dragHandleClassName={PAGE_DRAG_HANDLE_CLASS_NAME}
              onClick={() => onBlockSelect?.(b.id)}
              onBlockDoubleClick={() => onBlockDoubleClick?.(b.id)}
              onClickAway={onBlockSelect}
              onRemove={onBlockDelete}
              onPropertyUpdate={onPropertyUpdate}
              onPropertyItemAdd={onPropertyItemAdd}
              onPropertyItemMove={onPropertyItemMove}
              onPropertyItemDelete={onPropertyItemDelete}
              renderBlock={renderBlock}
              padding={panelSettings?.padding?.value}
            />
            {isEditable && !disableSelection && (
              <BlockAddBar
                id={b.id + "below-bar"}
                openBlocks={openBlocksIndex === idx}
                installableBlocks={installableStoryBlocks}
                showAreaHeight={panelSettings?.gap?.value}
                parentWidth={STORY_PANEL_WIDTH}
                onBlockOpen={() => handleBlockOpen(idx)}
                onBlockAdd={handleBlockCreate(idx + 1)}
              />
            )}
          </Fragment>
        ),
      })),
    [
      storyBlocks,
      page?.id,
      selectedStoryBlockId,
      isEditable,
      onBlockSelect,
      onBlockDelete,
      onPropertyUpdate,
      onPropertyItemAdd,
      onPropertyItemMove,
      onPropertyItemDelete,
      renderBlock,
      panelSettings?.padding?.value,
      panelSettings?.gap?.value,
      disableSelection,
      openBlocksIndex,
      installableStoryBlocks,
      handleBlockCreate,
      onBlockDoubleClick,
      handleBlockOpen,
    ],
  );
  return (
    <SelectableArea
      title={page?.title !== "Untitled" ? page?.title : t("Page")}
      position="left-bottom"
      icon="storyPage"
      noBorder
      isSelected={selectedPageId === page?.id}
      propertyId={propertyId}
      contentSettings={panelSettings}
      showSettings={showPageSettings}
      isEditable={isEditable}
      hideHoverUI={disableSelection}
      domId={`story-page-${page?.id}`}
      onClick={() => onPageSelect?.(page?.id)}
      onClickAway={onPageSelect}
      onSettingsToggle={onPageSettingsToggle}
      onPropertyUpdate={onPropertyUpdate}
      onPropertyItemAdd={onPropertyItemAdd}
      onPropertyItemDelete={onPropertyItemDelete}
      onPropertyItemMove={onPropertyItemMove}>
      <ContentWrapper
        id={page?.id}
        ref={containerRef}
        isEditable={isEditable}
        minPaddingInEditor={MIN_STORY_PAGE_PADDING_IN_EDITOR}
        padding={panelSettings?.padding?.value}
        minGapInEditor={MIN_STORY_PAGE_GAP_IN_EDITOR}
        gap={panelSettings?.gap?.value}>
        <PageTitleWrapper>
          {(isEditable || titleProperty?.title?.title?.value) && (
            // The title block is a pseudo block.
            // It is not saved in the story block list and not draggable because
            // it is actually a field on the story page.
            <StoryBlock
              block={{
                id: titleId,
                pluginId: "reearth",
                extensionId: "titleStoryBlock",
                name: t("Title"),
                propertyId,
                property: titleProperty,
              }}
              isEditable={isEditable}
              isSelected={selectedStoryBlockId === titleId}
              onClick={() => onBlockSelect?.(titleId)}
              onBlockDoubleClick={() => onBlockDoubleClick?.(titleId)}
              onClickAway={onBlockSelect}
              onPropertyUpdate={onPropertyUpdate}
              onPropertyItemAdd={onPropertyItemAdd}
              onPropertyItemMove={onPropertyItemMove}
              onPropertyItemDelete={onPropertyItemDelete}
              renderBlock={renderBlock}
            />
          )}
          {isEditable && !disableSelection && (
            <BlockAddBar
              id={titleId + "below-bar"}
              alwaysShow={storyBlocks && storyBlocks.length < 1}
              openBlocks={openBlocksIndex === -1}
              installableBlocks={installableStoryBlocks}
              showAreaHeight={panelSettings?.gap?.value}
              parentWidth={STORY_PANEL_WIDTH}
              onBlockOpen={() => handleBlockOpen(-1)}
              onBlockAdd={handleBlockCreate(0)}
            />
          )}
        </PageTitleWrapper>

        {storyBlocks && storyBlocks.length > 0 && (
          <DragAndDropList
            items={DraggableStoryBlockItems}
            handleClassName={PAGE_DRAG_HANDLE_CLASS_NAME}
            onMoveEnd={handleMoveEnd}
            dragDisabled={false}
            gap={20}
          />
        )}
      </ContentWrapper>
      {children}
    </SelectableArea>
  );
};

export default StoryPanel;

const PageTitleWrapper = styled("div")(() => ({
  position: "relative",
}));

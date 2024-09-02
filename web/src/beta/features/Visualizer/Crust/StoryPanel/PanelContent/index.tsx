import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import type { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { styled } from "@reearth/services/theme";
import { FC, MutableRefObject, ReactNode } from "react";

import { BlockProps } from "../../../shared/types";
import StoryPage from "../Page";
import { StoryBlock } from "../types";

import useHooks, {
  STORY_PANEL_CONTENT_ELEMENT_ID,
  type StoryPage as StoryPageType
} from "./hooks";

export type Props = {
  pages?: StoryPageType[];
  selectedPageId?: string;
  installableStoryBlocks?: InstallableStoryBlock[];
  selectedStoryBlockId?: string;
  showPageSettings?: boolean;
  showingIndicator?: boolean;
  isAutoScrolling?: MutableRefObject<boolean>;
  isEditable?: boolean;
  onPageSettingsToggle?: () => void;
  onPageSelect?: (pageId?: string | undefined) => void;
  onCurrentPageChange?: (
    pageId: string,
    disableScrollIntoView?: boolean
  ) => void;
  onBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined
  ) => Promise<void>;
  onBlockMove?: (id: string, targetId: number, blockId: string) => void;
  onBlockDelete?: (
    pageId?: string | undefined,
    blockId?: string | undefined
  ) => Promise<void>;
  onBlockSelect?: (blockId?: string) => void;
  onBlockDoubleClick?: (blockId?: string) => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
  renderBlock?: (block: BlockProps<StoryBlock>) => ReactNode;
};

const StoryContent: FC<Props> = ({
  pages,
  selectedPageId,
  installableStoryBlocks,
  selectedStoryBlockId,
  showPageSettings,
  showingIndicator,
  isAutoScrolling,
  isEditable,
  onPageSettingsToggle,
  onPageSelect,
  onCurrentPageChange,
  onBlockCreate,
  onBlockDelete,
  onBlockSelect,
  onBlockDoubleClick,
  onBlockMove,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete,
  renderBlock
}) => {
  const {
    pageGap,
    scrollTimeoutRef,
    disableSelection,
    handleBlockCreate,
    handleBlockDelete
  } = useHooks({
    onBlockCreate,
    onBlockDelete
  });

  return (
    <PagesWrapper
      id={STORY_PANEL_CONTENT_ELEMENT_ID}
      showingIndicator={showingIndicator}
      isEditable={isEditable && !disableSelection}
    >
      {pages?.map((p) => (
        <StoryPage
          key={p.id}
          page={p}
          selectedPageId={selectedPageId}
          installableStoryBlocks={installableStoryBlocks}
          selectedStoryBlockId={selectedStoryBlockId}
          showPageSettings={showPageSettings}
          isEditable={isEditable}
          scrollTimeoutRef={scrollTimeoutRef}
          isAutoScrolling={isAutoScrolling}
          onCurrentPageChange={onCurrentPageChange}
          onPageSettingsToggle={onPageSettingsToggle}
          onPageSelect={onPageSelect}
          onBlockCreate={handleBlockCreate(p.id)}
          onBlockDelete={handleBlockDelete(p.id)}
          onBlockSelect={onBlockSelect}
          onBlockDoubleClick={onBlockDoubleClick}
          onBlockMove={onBlockMove}
          onPropertyUpdate={onPropertyUpdate}
          onPropertyItemAdd={onPropertyItemAdd}
          onPropertyItemMove={onPropertyItemMove}
          onPropertyItemDelete={onPropertyItemDelete}
          renderBlock={renderBlock}
        >
          <PageGap height={pageGap} onClick={() => onPageSelect?.(p.id)} />
        </StoryPage>
      ))}
    </PagesWrapper>
  );
};

export default StoryContent;

const PagesWrapper = styled("div")<{
  showingIndicator?: boolean;
  isEditable?: boolean;
}>(({ showingIndicator, isEditable }) => ({
  height: showingIndicator ? "calc(100% - 8px)" : "100%",
  overflowY: "auto",
  cursor: isEditable ? "pointer" : "default",
  ["::-webkit-scrollbar"]: {
    display: "none"
  },
  scrollbarWidth: "none",
  msOverflowStyle: "none"
}));

const PageGap = styled("div")<{ height?: number }>(({ height }) => ({
  height: height ? `${height}px` : "70vh"
}));

import { Fragment, MutableRefObject } from "react";

import type { FlyTo } from "@reearth/beta/lib/core/types";
import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import type { Camera } from "@reearth/beta/utils/value";
import type { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { styled } from "@reearth/services/theme";

import StoryPage from "../Page";

import useHooks, { PAGES_ELEMENT_ID, type Page } from "./hooks";

export type Props = {
  pages?: Page[];
  selectedPageId?: string;
  installableStoryBlocks?: InstallableStoryBlock[];
  selectedStoryBlockId?: string;
  showPageSettings?: boolean;
  showingIndicator?: boolean;
  isAutoScrolling?: MutableRefObject<boolean>;
  isEditable?: boolean;
  onPageSettingsToggle?: () => void;
  onPageSelect?: (pageId?: string | undefined) => void;
  onBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  onBlockDelete?: (pageId?: string | undefined, blockId?: string | undefined) => Promise<void>;
  onBlockSelect?: (blockId?: string) => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  onCurrentPageChange?: (pageId: string) => void;
  onStoryBlockMove: (id: string, targetId: number, blockId: string) => void;
  currentCamera?: Camera;
  onFlyTo: FlyTo;
};

const StoryContent: React.FC<Props> = ({
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
  onBlockCreate,
  onBlockDelete,
  onBlockSelect,
  onPropertyUpdate,
  onCurrentPageChange,
  onStoryBlockMove,
  currentCamera,
  onFlyTo,
}) => {
  const { pageGap, handleBlockCreate, handleBlockDelete } = useHooks({
    pages,
    selectedPageId,
    isAutoScrolling,
    onBlockCreate,
    onBlockDelete,
    onCurrentPageChange,
  });

  return (
    <PagesWrapper id={PAGES_ELEMENT_ID} showingIndicator={showingIndicator} isEditable={isEditable}>
      {pages?.map(p => (
        <Fragment key={p.id}>
          <StoryPage
            page={p}
            selectedPageId={selectedPageId}
            installableStoryBlocks={installableStoryBlocks}
            selectedStoryBlockId={selectedStoryBlockId}
            showPageSettings={showPageSettings}
            isEditable={isEditable}
            onPageSettingsToggle={onPageSettingsToggle}
            onPageSelect={onPageSelect}
            onBlockCreate={handleBlockCreate(p.id)}
            onBlockDelete={handleBlockDelete(p.id)}
            onBlockSelect={onBlockSelect}
            onStoryBlockMove={onStoryBlockMove}
            onPropertyUpdate={onPropertyUpdate}
            currentCamera={currentCamera}
            onFlyTo={onFlyTo}
          />
          <PageGap height={pageGap} onClick={() => onPageSelect?.(p.id)} />
        </Fragment>
      ))}
    </PagesWrapper>
  );
};

export default StoryContent;

const PagesWrapper = styled.div<{ showingIndicator?: boolean; isEditable?: boolean }>`
  height: ${({ showingIndicator }) => (showingIndicator ? "calc(100% - 8px)" : "100%")};
  overflow-y: auto;
  cursor: ${({ isEditable }) => (isEditable ? "pointer" : "default")};

  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const PageGap = styled.div<{ height?: number }>`
  height: ${({ height }) => (height ? height + "px" : "70vh")};
`;

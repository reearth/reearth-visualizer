import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

import { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { styled } from "@reearth/services/theme";

import { GQLStoryPage } from "../hooks";
import StoryPage from "../Page";

export const pagesElementId = "story-page-content";

export type Props = {
  sceneId?: string;
  storyId?: string;
  pages?: GQLStoryPage[];
  selectedPageId?: string;
  installableStoryBlocks?: InstallableStoryBlock[];
  selectedStoryBlockId?: string;
  showPageSettings?: boolean;
  showingIndicator?: boolean;
  isAutoScrolling?: boolean;
  onAutoScrollingChange: (isScrolling: boolean) => void;
  onPageSettingsToggle?: () => void;
  onPageSelect?: (pageId?: string | undefined) => void;
  onBlockSelect: (blockId?: string) => void;
  onCurrentPageChange?: (pageId: string) => void;
  handleMoveBlock: (id: string, targetId: number, blockId: string) => void;
};

const StoryContent: React.FC<Props> = ({
  sceneId,
  storyId,
  pages,
  selectedPageId,
  installableStoryBlocks,
  selectedStoryBlockId,
  showPageSettings,
  showingIndicator,
  isAutoScrolling,
  onAutoScrollingChange,
  onPageSettingsToggle,
  onPageSelect,
  onBlockSelect,
  onCurrentPageChange,
  handleMoveBlock,
}) => {
  const scrollRef = useRef<number | undefined>(undefined);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const [pageGap, setPageGap] = useState<number>();

  useLayoutEffect(() => {
    const pageWrapperElement = document.getElementById(pagesElementId);
    if (pageWrapperElement) setPageGap(pageWrapperElement.clientHeight - 40); // 40px is the height of the page title block
  }, [setPageGap]);

  useEffect(() => {
    const resizeCallback = () => {
      const pageWrapperElement = document.getElementById(pagesElementId);
      if (pageWrapperElement) setPageGap(pageWrapperElement.clientHeight - 40); // 40px is the height of the page title block
    };
    window.addEventListener("resize", resizeCallback);
    return () => window.removeEventListener("resize", resizeCallback);
  }, []);

  useEffect(() => {
    const ids = pages?.map(p => p.id) as string[];
    const panelContentElement = document.getElementById(pagesElementId);

    const observer = new IntersectionObserver(
      entries => {
        if (isAutoScrolling) return; // to avoid conflicts with page selection in editor UI
        entries.forEach(entry => {
          const id = entry.target.getAttribute("id") ?? "";
          if (selectedPageId === id) return;

          const diff = (scrollRef.current as number) - (panelContentElement?.scrollTop as number);
          const isScrollingUp = diff > 0;

          if (entry.isIntersecting) {
            onCurrentPageChange?.(id);
            scrollRef.current = panelContentElement?.scrollTop;
            return;
          }
          const currentIndex = ids?.indexOf(id) as number;
          const prevEntry = ids[currentIndex - 1];
          if (isScrollingUp) {
            const id = prevEntry;
            onCurrentPageChange?.(id);
          }
        });
      },
      {
        root: panelContentElement,
        threshold: 0.2,
      },
    );
    ids?.forEach(id => {
      const e = document.getElementById(id);
      if (e) {
        observer.observe(e);
      }
    });
    return () => {
      ids?.forEach(id => {
        const e = document.getElementById(id);
        if (e) {
          observer.unobserve(e);
        }
      });
    };
  }, [pages, selectedPageId, isAutoScrolling, onCurrentPageChange]);

  useEffect(() => {
    const wrapperElement = document.getElementById(pagesElementId);
    if (isAutoScrolling) {
      wrapperElement?.addEventListener("scroll", () => {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(function () {
          onAutoScrollingChange(false);
        }, 100);
      });
    }
  }, [isAutoScrolling, onAutoScrollingChange]);

  return (
    <PagesWrapper id={pagesElementId} showingIndicator={showingIndicator}>
      {pages?.map(p => (
        <Fragment key={p.id}>
          <StoryPage
            sceneId={sceneId}
            storyId={storyId}
            page={p}
            selectedPageId={selectedPageId}
            installableStoryBlocks={installableStoryBlocks}
            selectedStoryBlockId={selectedStoryBlockId}
            showPageSettings={showPageSettings}
            onPageSettingsToggle={onPageSettingsToggle}
            onPageSelect={onPageSelect}
            onBlockSelect={onBlockSelect}
            handleMoveBlock={handleMoveBlock}
          />
          <PageGap height={pageGap} />
        </Fragment>
      ))}
    </PagesWrapper>
  );
};

export default StoryContent;

const PagesWrapper = styled.div<{ showingIndicator?: boolean }>`
  height: ${({ showingIndicator }) => (showingIndicator ? "calc(100% - 8px)" : "100%")};
  overflow-y: auto;
  cursor: pointer;
`;

const PageGap = styled.div<{ height?: number }>`
  height: ${({ height }) => (height ? height + "px" : "70vh")};
`;

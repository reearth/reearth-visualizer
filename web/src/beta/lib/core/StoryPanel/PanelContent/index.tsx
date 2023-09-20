import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

import { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { styled } from "@reearth/services/theme";

import type { Page } from "../hooks";
import StoryPage from "../Page";

export const PAGES_ELEMENT_ID = "story-page-content";

export type Props = {
  sceneId?: string;
  storyId?: string;
  pages?: Page[];
  selectedPageId?: string;
  installableStoryBlocks?: InstallableStoryBlock[];
  selectedStoryBlockId?: string;
  showPageSettings?: boolean;
  showingIndicator?: boolean;
  isAutoScrolling?: boolean;
  isEditable?: boolean;
  onAutoScrollingChange: (isScrolling: boolean) => void;
  onPageSettingsToggle?: () => void;
  onPageSelect?: (pageId?: string | undefined) => void;
  onBlockSelect: (blockId?: string) => void;
  onCurrentPageChange?: (pageId: string) => void;
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
  isEditable,
  onAutoScrollingChange,
  onPageSettingsToggle,
  onPageSelect,
  onBlockSelect,
  onCurrentPageChange,
}) => {
  const scrollRef = useRef<number | undefined>(undefined);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const [pageGap, setPageGap] = useState<number>();

  useLayoutEffect(() => {
    const pageWrapperElement = document.getElementById(PAGES_ELEMENT_ID);
    if (pageWrapperElement) setPageGap(pageWrapperElement.clientHeight - 40); // 40px is the height of the page title block
  }, [setPageGap]);

  useEffect(() => {
    const resizeCallback = () => {
      const pageWrapperElement = document.getElementById(PAGES_ELEMENT_ID);
      if (pageWrapperElement) setPageGap(pageWrapperElement.clientHeight - 40); // 40px is the height of the page title block
    };
    window.addEventListener("resize", resizeCallback);
    return () => window.removeEventListener("resize", resizeCallback);
  }, []);

  useEffect(() => {
    const ids = pages?.map(p => p.id) as string[];
    const panelContentElement = document.getElementById(PAGES_ELEMENT_ID);

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
    const wrapperElement = document.getElementById(PAGES_ELEMENT_ID);
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
    <PagesWrapper id={PAGES_ELEMENT_ID} showingIndicator={showingIndicator} isEditable={isEditable}>
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
            isEditable={isEditable}
            onPageSettingsToggle={onPageSettingsToggle}
            onPageSelect={onPageSelect}
            onBlockSelect={onBlockSelect}
          />
          <PageGap height={pageGap} />
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
`;

const PageGap = styled.div<{ height?: number }>`
  height: ${({ height }) => (height ? height + "px" : "70vh")};
`;

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { Page } from "../hooks";

export type { Page } from "../hooks";

export const PAGES_ELEMENT_ID = "story-page-content";

export default ({
  pages,
  selectedPageId,
  isAutoScrolling,
  onAutoScrollingChange,
  onBlockCreate,
  onCurrentPageChange,
}: {
  pages?: Page[];
  selectedPageId?: string;
  isAutoScrolling?: boolean;
  onAutoScrollingChange: (isScrolling: boolean) => void;
  onBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  onCurrentPageChange?: (pageId: string) => void;
}) => {
  const scrollRef = useRef<number | undefined>(undefined);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const [pageGap, setPageGap] = useState<number>();

  const handleBlockCreate = useCallback(
    (pageId: string) =>
      (
        extensionId?: string | undefined,
        pluginId?: string | undefined,
        index?: number | undefined,
      ) =>
        onBlockCreate?.(pageId, extensionId, pluginId, index),
    [onBlockCreate],
  );

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

  return {
    pageGap,
    handleBlockCreate,
  };
};

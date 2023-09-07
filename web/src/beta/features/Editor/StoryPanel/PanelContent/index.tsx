import { Fragment, useMemo } from "react";

import { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { styled } from "@reearth/services/theme";

import { StoryPageFragmentFragment } from "../hooks";
import StoryPage from "../Page";

export const pagesElementId = "story-page-content";

export type Props = {
  sceneId?: string;
  storyId?: string;
  pages?: StoryPageFragmentFragment[];
  selectedPageId?: string;
  installableStoryBlocks?: InstallableStoryBlock[];
  selectedStoryBlockId?: string;
  showPageSettings?: boolean;
  showingIndicator?: boolean;
  onPageSettingsToggle?: () => void;
  onPageSelect?: (pageId?: string | undefined) => void;
  onBlockSelect: (blockId?: string) => void;
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
  onPageSettingsToggle,
  onPageSelect,
  onBlockSelect,
}) => {
  // const headingsRef = useRef<Element[]>();
  // const scrollRef = useRef(0);

  const pageHeight = useMemo(() => {
    const element = document.getElementById(pagesElementId);
    return element?.clientHeight;
  }, []);

  return (
    <PagesWrapper id={pagesElementId} showingIndicator={showingIndicator}>
      {pages?.map(p => {
        // const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        //   entries.map(entry => {
        //     console.log("BBB: ", entry.boundingClientRect);
        //     if (entry.isIntersecting && currentPage?.id !== p.id) {
        //       // console.log("NEW PAGE:", p.id);
        //       // console.log("NEW PAGE:", currentPage);
        //       onPageSelect(p.id);
        //     } else {
        //       // entry.target.classList.remove('visible')
        //     }
        //   });
        // };

        // const observer = new IntersectionObserver(handleIntersection);
        // const pageElement = document.getElementById(p.id);
        // if (pageElement && p.id !== currentPage?.id) {
        //   observer.observe(pageElement);
        // }
        return (
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
            />
            <PageGap height={pageHeight} />
          </Fragment>
        );
      })}
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

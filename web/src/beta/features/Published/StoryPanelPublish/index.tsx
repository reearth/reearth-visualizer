import { Fragment } from "react";

import PageIndicator from "@reearth/beta/features/Editor/StoryPanel/PageIndicator";
import { convert } from "@reearth/services/api/propertyApi/utils";
import { styled } from "@reearth/services/theme";

import useHooks, { pageElementId } from "./hooks";
import StoryPage from "./storyPage";

export const storyPanelWidth = 442;

type Props = {
  sceneId?: string;
};

const StoryPanelPublished: React.FC<Props> = ({ sceneId }) => {
  const { pageInfo, selectedStory } = useHooks();

  const element = document.getElementById(pageElementId);

  return (
    <Wrapper>
      {!!pageInfo && (
        <PageIndicator
          currentPage={pageInfo.selectedPage}
          maxPage={pageInfo.maxPage}
          onPageChange={pageInfo.onPageChange}
        />
      )}
      <PageWrapper id={pageElementId} showingIndicator={!!pageInfo}>
        {selectedStory?.pages.map(p => {
          const propertyItems = convert(p.property);

          return (
            <Fragment key={p.id}>
              <StoryPage
                sceneId={sceneId}
                storyId={selectedStory.id}
                pageId={p.id}
                propertyId={p.property?.id}
                propertyItems={propertyItems}
              />
              <PageGap height={element?.clientHeight} />
            </Fragment>
          );
        })}
      </PageWrapper>
    </Wrapper>
  );
};

export default StoryPanelPublished;

const Wrapper = styled.div`
  flex: 0 0 ${storyPanelWidth}px;
  background: #f1f1f1;
  color: ${({ theme }) => theme.content.weak};
`;

const PageWrapper = styled.div<{ showingIndicator?: boolean }>`
  height: ${({ showingIndicator }) => (showingIndicator ? "calc(100% - 8px)" : "100%")};
  overflow-y: auto;
  cursor: pointer;
`;

const PageGap = styled.div<{ height?: number }>`
  height: ${({ height }) => (height ? height + "px" : "70vh")};
`;

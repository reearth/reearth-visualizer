import { Fragment } from "react";

import Text from "@reearth/beta/components/Text";
import { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { styled } from "@reearth/services/theme";

import StoryBlock from "../Block";

import BlockAddBar from "./BlockAddBar";
import useHooks from "./hooks";

type Props = {
  sceneId?: string;
  storyId?: string;
  pageId?: string;
  pageTitle?: string;
  installableStoryBlocks?: InstallableStoryBlock[];
  selectedStoryBlockId?: string;
  onBlockSelect: (blockId: string) => void;
};

const StoryPage: React.FC<Props> = ({
  sceneId,
  storyId,
  pageId,
  pageTitle,
  installableStoryBlocks,
  selectedStoryBlockId,
  onBlockSelect,
}) => {
  const {
    openBlocksIndex,
    installedStoryBlocks,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
    handleBlockOpen,
    handlePropertyValueUpdate,
  } = useHooks({
    sceneId,
    storyId,
    pageId,
  });

  return (
    <Wrapper id={pageId}>
      <Text size="h2" customColor>
        {pageTitle ?? "No Title"}
      </Text>
      <BlockAddBar
        openBlocks={openBlocksIndex === -1}
        installableStoryBlocks={installableStoryBlocks}
        onBlockOpen={() => handleBlockOpen(-1)}
        onBlockAdd={handleStoryBlockCreate(0)}
      />
      {installedStoryBlocks &&
        installedStoryBlocks.length > 0 &&
        installedStoryBlocks.map((b, idx) => (
          <Fragment key={idx}>
            <StoryBlock
              block={b}
              isSelected={selectedStoryBlockId === b.id}
              onClick={() => onBlockSelect(b.id)}
              onChange={handlePropertyValueUpdate}
              onRemove={handleStoryBlockDelete}
            />
            <BlockAddBar
              openBlocks={openBlocksIndex === idx}
              installableStoryBlocks={installableStoryBlocks}
              onBlockOpen={() => handleBlockOpen(idx)}
              onBlockAdd={handleStoryBlockCreate(idx + 1)}
            />
          </Fragment>
        ))}
    </Wrapper>
  );
};

export default StoryPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.content.weaker};
  padding: 20px;
  box-sizing: border-box;
`;

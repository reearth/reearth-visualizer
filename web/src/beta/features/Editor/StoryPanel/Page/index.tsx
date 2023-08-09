import { Fragment, useCallback, useState } from "react";

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
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();

  const { installedStoryBlocks, handleStoryBlockCreate, handleStoryBlockDelete } = useHooks({
    sceneId,
    storyId,
    pageId,
  });

  const handleBlockOpen = useCallback(
    (index: number) => {
      if (openBlocksIndex === index) {
        setOpenBlocksIndex(undefined);
      } else {
        setOpenBlocksIndex(index);
      }
    },
    [openBlocksIndex],
  );

  return (
    <Wrapper>
      <Text size="h2" customColor>
        {pageTitle ?? "No Title"}
      </Text>
      {installedStoryBlocks && installedStoryBlocks.length > 0 ? (
        installedStoryBlocks?.map((b, idx) => (
          <Fragment key={idx}>
            <StoryBlock
              block={b}
              isSelected={selectedStoryBlockId === b.id}
              onClick={() => onBlockSelect(b.id)}
              onRemove={handleStoryBlockDelete}
            />
            <BlockAddBar
              openBlocks={openBlocksIndex === idx}
              installableStoryBlocks={installableStoryBlocks}
              onBlockOpen={() => handleBlockOpen(idx)}
              onBlockAdd={handleStoryBlockCreate}
            />
          </Fragment>
        ))
      ) : (
        <BlockAddBar
          openBlocks={openBlocksIndex === -1}
          installableStoryBlocks={installableStoryBlocks}
          onBlockOpen={() => handleBlockOpen(-1)}
          onBlockAdd={handleStoryBlockCreate}
        />
      )}
    </Wrapper>
  );
};

export default StoryPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.content.weaker};
`;

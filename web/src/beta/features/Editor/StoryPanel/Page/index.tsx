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
};

const StoryPage: React.FC<Props> = ({
  sceneId,
  storyId,
  pageId,
  pageTitle,
  installableStoryBlocks,
}) => {
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();

  const { installedStoryBlocks, handleStoryBlockCreate } = useHooks({ sceneId, storyId, pageId });

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

  const handleBlockAdd = useCallback(
    (extensionId: string, pluginId: string) => {
      handleStoryBlockCreate(extensionId, pluginId);
    },
    [handleStoryBlockCreate],
  );

  return (
    <Wrapper>
      <Text size="h2" customColor>
        {pageTitle ?? "No Title"}
      </Text>
      {installedStoryBlocks && installedStoryBlocks.length > 0 ? (
        installedStoryBlocks?.map((b, idx) => (
          <Fragment key={idx}>
            <StoryBlock block={b} />
            <BlockAddBar
              openBlocks={openBlocksIndex === idx}
              installableStoryBlocks={installableStoryBlocks}
              onBlockOpen={() => handleBlockOpen(idx)}
              onBlockAdd={handleBlockAdd}
            />
          </Fragment>
        ))
      ) : (
        <BlockAddBar
          openBlocks={openBlocksIndex === -1}
          installableStoryBlocks={installableStoryBlocks}
          onBlockOpen={() => handleBlockOpen(-1)}
          onBlockAdd={handleBlockAdd}
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

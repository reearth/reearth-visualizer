import { Fragment } from "react";

import { Item } from "@reearth/services/api/propertyApi/utils";
import { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { styled } from "@reearth/services/theme";

import StoryBlock from "../Block";

import BlockAddBar from "./BlockAddBar";
import useHooks from "./hooks";

type Props = {
  sceneId?: string;
  storyId?: string;
  pageId?: string;
  propertyId?: string;
  propertyItems?: Item[];
  installableStoryBlocks?: InstallableStoryBlock[];
  selectedStoryBlockId?: string;
  onBlockSelect: (blockId?: string) => void;
};

const StoryPage: React.FC<Props> = ({
  sceneId,
  storyId,
  pageId,
  propertyId,
  propertyItems,
  installableStoryBlocks,
  selectedStoryBlockId,
  onBlockSelect,
}) => {
  const {
    openBlocksIndex,
    installedStoryBlocks,
    titleId,
    titleProperty,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
    handleBlockOpen,
    handlePropertyValueUpdate,
  } = useHooks({
    sceneId,
    storyId,
    pageId,
    propertyItems,
  });

  return (
    <Wrapper id={pageId}>
      {titleProperty && (
        <StoryBlock
          block={{
            id: titleId,
            pluginId: "reearth",
            extensionId: "titleStoryBlock",
            title: titleProperty.title,
            property: {
              id: propertyId ?? "",
              items: [titleProperty],
            },
          }}
          isSelected={selectedStoryBlockId === titleId}
          onClick={() => onBlockSelect(titleId)}
          onClickAway={onBlockSelect}
          onChange={handlePropertyValueUpdate}
        />
      )}
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
              onClickAway={onBlockSelect}
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

import { Fragment, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

import { convert } from "@reearth/services/api/propertyApi/utils";
import { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import StoryBlock from "../Block";
import { StoryPageFragmentFragment } from "../hooks";
import SelectableArea from "../SelectableArea";

import BlockAddBar from "./BlockAddBar";
import useHooks from "./hooks";

type Props = {
  sceneId?: string;
  storyId?: string;
  page?: StoryPageFragmentFragment;
  selectedPageId?: string;
  installableStoryBlocks?: InstallableStoryBlock[];
  selectedStoryBlockId?: string;
  showPageSettings?: boolean;
  onPageSettingsToggle?: () => void;
  onPageSelect?: (pageId?: string | undefined) => void;
  onBlockSelect: (blockId?: string) => void;
};

const StoryPage: React.FC<Props> = ({
  sceneId,
  storyId,
  page,
  selectedPageId,
  installableStoryBlocks,
  selectedStoryBlockId,
  showPageSettings,
  onPageSettingsToggle,
  onPageSelect,
  onBlockSelect,
}) => {
  const t = useT();
  const propertyItems = useMemo(() => convert(page?.property), [page?.property]);

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
    pageId: page?.id,
    propertyItems,
  });

  const [itemData, setItemData] = useState(installedStoryBlocks);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && destination.index === source.index)
      return;

    let add;
    const activeBlock = itemData;
    if (source.droppableId === "droppable") {
      add = activeBlock?.[source.index];
      activeBlock?.splice(source.index, 1);
    }
    if (destination.droppableId === "droppable") {
      activeBlock?.splice(destination.index, 0, add);
    }
    setItemData(activeBlock);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable" type="ITEM">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <SelectableArea
              title={page?.title ?? t("Page")}
              position="left-bottom"
              icon="storyPage"
              noBorder
              isSelected={selectedPageId === page?.id}
              propertyId={page?.property?.id}
              propertyItems={propertyItems}
              onClick={() => onPageSelect?.(page?.id)}
              showSettings={showPageSettings}
              onSettingsToggle={onPageSettingsToggle}>
              <Wrapper id={page?.id}>
                {titleProperty && (
                  <StoryBlock
                    block={{
                      id: titleId,
                      pluginId: "reearth",
                      extensionId: "titleStoryBlock",
                      title: titleProperty.title,
                      property: {
                        id: page?.property?.id ?? "",
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
                  itemData?.map((b, idx) => (
                    <Draggable key={b.id} draggableId={b.id} index={idx}>
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}>
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
                        </div>
                      )}
                    </Draggable>
                  ))}
              </Wrapper>
            </SelectableArea>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
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

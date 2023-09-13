import { Fragment, useMemo, useState, useEffect } from "react";

import DragAndDropList from "@reearth/beta/components/DragAndDropList";
import { convert } from "@reearth/services/api/propertyApi/utils";
import { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import StoryBlock from "../Block";
import { GQLStoryPage } from "../hooks";
import SelectableArea from "../SelectableArea";

import BlockAddBar from "./BlockAddBar";
import useHooks from "./hooks";

type Props = {
  sceneId?: string;
  storyId?: string;
  page?: GQLStoryPage;
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

  const [items, setItems] = useState(installedStoryBlocks);

  useEffect(() => {
    setItems(installedStoryBlocks);
  }, [installedStoryBlocks]);

  return (
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

        {installedStoryBlocks && installedStoryBlocks.length > 0 && (
          <DragAndDropList
            uniqueKey="LeftPanelPages"
            gap={8}
            items={items}
            getId={item => item.id}
            onItemDrop={async (item, index) => {
              setItems(old => {
                const items = [...old];
                items.splice(
                  old.findIndex(o => o.id === item.id),
                  1,
                );
                items.splice(index, 0, item);
                return items;
              });
            }}
            renderItem={(block, i) => {
              return (
                <Fragment key={i}>
                  <StoryBlock
                    block={block}
                    isSelected={selectedStoryBlockId === block.id}
                    onClick={() => onBlockSelect(block.id)}
                    onClickAway={onBlockSelect}
                    onChange={handlePropertyValueUpdate}
                    onRemove={handleStoryBlockDelete}
                  />
                  <BlockAddBar
                    openBlocks={openBlocksIndex === i}
                    installableStoryBlocks={installableStoryBlocks}
                    onBlockOpen={() => handleBlockOpen(i)}
                    onBlockAdd={handleStoryBlockCreate(i + 1)}
                  />
                </Fragment>
              );
            }}
          />
        )}
      </Wrapper>
    </SelectableArea>
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

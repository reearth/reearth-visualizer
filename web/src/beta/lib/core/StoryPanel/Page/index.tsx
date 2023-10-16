import { Fragment } from "react";

import DragAndDropList from "@reearth/beta/components/DragAndDropList";
import type { Spacing, ValueType, ValueTypes } from "@reearth/beta/utils/value";
import type { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import StoryBlock from "../Block";
import SelectableArea from "../SelectableArea";

import BlockAddBar from "./BlockAddBar";
import useHooks, { type StoryPage } from "./hooks";

type Props = {
  page?: StoryPage;
  selectedPageId?: string;
  installableStoryBlocks?: InstallableStoryBlock[];
  selectedStoryBlockId?: string;
  showPageSettings?: boolean;
  isEditable?: boolean;
  onPageSettingsToggle?: () => void;
  onPageSelect?: (pageId?: string | undefined) => void;
  onBlockCreate?: (
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void> | undefined;
  onBlockDelete?: (blockId?: string | undefined) => Promise<void> | undefined;
  onBlockSelect?: (blockId?: string) => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  onStoryBlockMove: (id: string, targetId: number, blockId: string) => void;
};

const StoryPanel: React.FC<Props> = ({
  page,
  selectedPageId,
  installableStoryBlocks,
  selectedStoryBlockId,
  showPageSettings,
  isEditable,
  onPageSettingsToggle,
  onPageSelect,
  onBlockCreate,
  onBlockDelete,
  onBlockSelect,
  onPropertyUpdate,
  onStoryBlockMove,
}) => {
  const t = useT();

  const {
    openBlocksIndex,
    titleId,
    title,
    propertyId,
    panelSettings,
    storyBlocks,
    setStoryBlocks,
    handleBlockOpen,
    handleBlockCreate,
  } = useHooks({
    page,
    onBlockCreate,
  });

  return (
    <SelectableArea
      title={page?.title ?? t("Page")}
      position="left-bottom"
      icon="storyPage"
      noBorder
      isSelected={selectedPageId === page?.id}
      propertyId={propertyId}
      panelSettings={panelSettings}
      showSettings={showPageSettings}
      isEditable={isEditable}
      onClick={() => onPageSelect?.(page?.id)}
      onClickAway={onPageSelect}
      onSettingsToggle={onPageSettingsToggle}>
      <Wrapper
        id={page?.id}
        padding={panelSettings?.padding?.value}
        gap={panelSettings?.gap?.value}>
        <StoryBlock
          block={{
            id: titleId,
            pluginId: "reearth",
            extensionId: "titleStoryBlock",
            name: t("Title"),
            propertyId: page?.propertyId ?? "",
            property: { title },
          }}
          isEditable={isEditable}
          isSelected={selectedStoryBlockId === titleId}
          onClick={() => onBlockSelect?.(titleId)}
          onClickAway={onBlockSelect}
          onChange={onPropertyUpdate}
        />

        {isEditable && (
          <BlockAddBar
            alwaysShow={storyBlocks && storyBlocks.length < 1}
            openBlocks={openBlocksIndex === -1}
            installableStoryBlocks={installableStoryBlocks}
            onBlockOpen={() => handleBlockOpen(-1)}
            onBlockAdd={handleBlockCreate(0)}
          />
        )}
        {storyBlocks && storyBlocks.length > 0 && (
          <DragAndDropList
            uniqueKey="storyPanel"
            gap={panelSettings?.gap?.value}
            items={storyBlocks}
            getId={item => item.id}
            onItemDrop={async (item, index) => {
              setStoryBlocks(old => {
                const items = [...old];
                items.splice(
                  old.findIndex(o => o.id === item.id),
                  1,
                );
                items.splice(index, 0, item);
                return items;
              });
              await onStoryBlockMove(page?.id || "", index, item.id);
            }}
            renderItem={(b, idx) => {
              return (
                <Fragment key={idx}>
                  <StoryBlock
                    block={b}
                    isSelected={selectedStoryBlockId === b.id}
                    isEditable={isEditable}
                    onClick={() => onBlockSelect?.(b.id)}
                    onClickAway={onBlockSelect}
                    onChange={onPropertyUpdate}
                    onRemove={onBlockDelete}
                  />
                  {isEditable && (
                    <BlockAddBar
                      openBlocks={openBlocksIndex === idx}
                      installableStoryBlocks={installableStoryBlocks}
                      onBlockOpen={() => handleBlockOpen(idx)}
                      onBlockAdd={handleBlockCreate(idx + 1)}
                    />
                  )}
                </Fragment>
              );
            }}
          />
        )}
      </Wrapper>
    </SelectableArea>
  );
};

export default StoryPanel;

const Wrapper = styled.div<{ padding?: Spacing; gap?: number; isEditable?: boolean }>`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.content.weaker};
  ${({ gap }) => gap && `gap: ${gap}px;`}

  padding-top: ${({ padding, isEditable }) => calculatePadding(padding?.top, isEditable)};
  padding-bottom: ${({ padding, isEditable }) => calculatePadding(padding?.bottom, isEditable)};
  padding-left: ${({ padding, isEditable }) => calculatePadding(padding?.left, isEditable)};
  padding-right: ${({ padding, isEditable }) => calculatePadding(padding?.right, isEditable)};

  box-sizing: border-box;
`;

const calculatePadding = (value?: number, editorMode?: boolean) => {
  if (!value) {
    return editorMode ? "4px" : "0px";
  }
  return editorMode && value < 4 ? "4px" : value + "px";
};

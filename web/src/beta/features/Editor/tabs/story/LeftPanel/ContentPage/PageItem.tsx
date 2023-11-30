import { MouseEvent, useCallback, useEffect, useState } from "react";

import TextInput from "@reearth/beta/components/fields/common/TextInput";
import ListItem from "@reearth/beta/components/ListItem";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import useDoubleClick from "@reearth/classic/util/use-double-click";
import { ValueType, ValueTypes } from "@reearth/classic/util/value";
import type { Page } from "@reearth/services/api/storytellingApi/utils";
import { styled } from "@reearth/services/theme";

type PageItemProps = {
  isSelected?: boolean;
  title?: string;
  isOpenAction?: boolean;
  propertyId: string;
  storyPage: Page;
  onItemClick: (e?: MouseEvent<Element>) => void;
  onActionClick?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
  setOpenedPageId?: (pageId: string | undefined) => void;
  onPageDelete?: () => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
};

const PageItem = ({
  isSelected,
  isOpenAction,
  title,
  propertyId,
  storyPage,
  onItemClick,
  onActionClick,
  onOpenChange,
  setOpenedPageId,
  onPageDelete,
  onPropertyUpdate,
}: PageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(title);

  const [handleSingleClick, handleDoubleClick] = useDoubleClick(
    () => onItemClick?.(),
    () => setIsEditing(true),
  );

  useEffect(() => {
    setNewValue(title);
  }, [title]);

  const handleTitleSubmit = useCallback(
    (newTitle: string) => {
      setIsEditing(false);
      setNewValue(newTitle);
      if (newValue?.trim() !== "") {
        const schemaGroupId = storyPage.property.items?.[1]?.schemaGroup;
        onPropertyUpdate?.(propertyId, schemaGroupId, "title", undefined, "string", newTitle);
      }
    },
    [newValue, onPropertyUpdate, propertyId, storyPage.property.items],
  );

  const handleEditExit = useCallback(
    (e?: React.KeyboardEvent<HTMLInputElement>) => {
      if (!!newValue && title !== newValue && e?.key !== "Escape") {
        handleTitleSubmit(newValue);
      } else {
        setNewValue(title);
      }
      setIsEditing(false);
    },
    [title, newValue, handleTitleSubmit],
  );

  return (
    <ListItem
      border
      actionPlacement="bottom-start"
      isSelected={isSelected}
      isOpenAction={isOpenAction}
      onItemClick={handleSingleClick}
      onActionClick={onActionClick}
      onOpenChange={onOpenChange}
      actionContent={
        <PopoverMenuContent
          size="sm"
          items={[
            // {
            //   icon: "copy",
            //   name: "Duplicate",
            //   onClick: () => {
            //     setOpenedPageId(undefined);
            //     onPageDuplicate(storyPage.id);
            //   },
            // },
            {
              icon: "trash",
              name: "Delete",
              onClick: () => {
                setOpenedPageId?.(undefined);
                onPageDelete?.();
              },
            },
          ]}
        />
      }>
      {isEditing ? (
        <StyledTextInput
          value={newValue}
          autoFocus
          onChange={handleTitleSubmit}
          onExit={handleEditExit}
          onBlur={handleEditExit}
        />
      ) : (
        <PageTitle size="footnote" onDoubleClick={handleDoubleClick}>
          {title}
        </PageTitle>
      )}
    </ListItem>
  );
};

const StyledTextInput = styled(TextInput)`
  width: 100%;
`;

const PageTitle = styled(Text)`
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
`;

export default PageItem;

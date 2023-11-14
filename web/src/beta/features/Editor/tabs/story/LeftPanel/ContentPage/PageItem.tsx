import { MouseEvent, useCallback, useState } from "react";

import TextInput from "@reearth/beta/components/fields/common/TextInput";
import ListItem from "@reearth/beta/components/ListItem";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import useDoubleClick from "@reearth/classic/util/use-double-click";
import { ValueType, ValueTypes } from "@reearth/classic/util/value";
import type { Page } from "@reearth/services/api/storytellingApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type PageItemProps = {
  isSelected?: boolean;
  title?: string;
  isOpenAction?: boolean;
  hasEmptySpace?: boolean;
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
  hasEmptySpace,
  propertyId,
  storyPage,
  onItemClick,
  onActionClick,
  onOpenChange,
  setOpenedPageId,
  onPageDelete,
  onPropertyUpdate,
}: PageItemProps) => {
  const t = useT();
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(title);

  const [handleSingleClick, handleDoubleClick] = useDoubleClick(
    () => onItemClick?.(),
    () => setIsEditing(true),
  );

  const handleChange = useCallback((newTitle: string) => setNewValue(newTitle), []);

  const handleTitleSubmit = useCallback(() => {
    setIsEditing(false);
    if (newValue?.trim() !== "") {
      const schemaGroupId = storyPage.property.items?.[1]?.schemaGroup;
      onPropertyUpdate?.(propertyId, schemaGroupId, "title", undefined, "string", newValue);
    }
  }, [newValue, onPropertyUpdate, propertyId, storyPage.property.items]);

  const handleEditExit = useCallback(
    (e?: React.KeyboardEvent<HTMLInputElement>) => {
      if (title !== newValue && e?.key !== "Escape") {
        handleTitleSubmit();
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
          timeout={0}
          autoFocus
          onChange={handleChange}
          onExit={handleEditExit}
          onBlur={handleEditExit}
        />
      ) : (
        <PageTitle onDoubleClick={handleDoubleClick}>
          {hasEmptySpace || !title ? t("Untitled") : title}
        </PageTitle>
      )}
    </ListItem>
  );
};

const StyledTextInput = styled(TextInput)`
  width: 100%;
  font-size: 12px;
  color: ${({ theme }) => theme.content.main};
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const PageTitle = styled.div`
  overflow: hidden;
  color: ${({ theme }) => theme.content.main};
  text-overflow: ellipsis;
  font-family: Noto Sans;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

export default PageItem;

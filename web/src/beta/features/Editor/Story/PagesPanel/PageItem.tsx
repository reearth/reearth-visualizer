import { FC, useCallback, useMemo, useState } from "react";

import { getFieldValue } from "@reearth/beta/features/Visualizer/Crust/StoryPanel/utils";
import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { EntryItem } from "@reearth/beta/ui/components";
import { isEmptyString } from "@reearth/beta/utils/util";
import { Page } from "@reearth/services/api/storytellingApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { useStoryPage } from "../context";

interface PageItemProps {
  storyPage: Page;
  dragHandleClassName?: string;
  isDragging?: boolean;
  pageCount?: number;
}

const PageItem: FC<PageItemProps> = ({ storyPage, pageCount, dragHandleClassName, isDragging }) => {
  const t = useT();
  const {
    selectedStoryPage,
    handleStoryPageSelect,
    handleStoryPageDelete,
    handlePropertyValueUpdate,
  } = useStoryPage();

  const title = (getFieldValue(storyPage.property.items ?? [], "title", "title") ??
    t("Untitled")) as string;
  const hasEmptySpace = isEmptyString(title);

  const [editingPageNameId, setEditingPageNameId] = useState("");
  const [localTitle, setLocalTitle] = useState(title);

  const handleStoryPageItemClick = useCallback(() => {
    if (storyPage.id === selectedStoryPage?.id) return;
    handleStoryPageSelect(storyPage.id);
    setEditingPageNameId("");
  }, [storyPage.id, selectedStoryPage?.id, handleStoryPageSelect]);

  const handleTitleUpdate = useCallback(() => {
    setEditingPageNameId("");
    if (!localTitle || localTitle === storyPage.title) return;
    const schemaGroupId = storyPage.property.items?.[1]?.schemaGroup;
    handlePropertyValueUpdate?.(
      storyPage.property.id,
      schemaGroupId,
      "title",
      undefined,
      "string",
      localTitle,
    );
  }, [
    handlePropertyValueUpdate,
    localTitle,
    storyPage.property.id,
    storyPage.property.items,
    storyPage.title,
  ]);

  const optionsMenu = useMemo(
    () => [
      {
        id: "rename",
        title: "Rename",
        icon: "pencilSimple" as const,
        onClick: () => setEditingPageNameId(storyPage.id),
      },
      {
        id: "delete",
        title: "Delete",
        icon: "trash" as const,
        onClick: () => handleStoryPageDelete(storyPage.id),
      },
    ],
    [storyPage.id, handleStoryPageDelete],
  );

  return (
    <Wrapper>
      <PageCount>{pageCount}.</PageCount>
      <EntryItemWrapper>
        <EntryItem
          title={
            editingPageNameId === storyPage.id ? (
              <TextInput
                size="small"
                extendWidth
                autoFocus
                value={localTitle}
                onChange={setLocalTitle}
                onBlur={handleTitleUpdate}
              />
            ) : (
              <TitleWrapper onDoubleClick={() => setEditingPageNameId(storyPage.id)}>
                {hasEmptySpace || !title ? t("Untitled") : title}
              </TitleWrapper>
            )
          }
          dragHandleClassName={dragHandleClassName}
          highlighted={selectedStoryPage?.id === storyPage.id}
          disableHover={isDragging}
          onClick={handleStoryPageItemClick}
          optionsMenu={optionsMenu}
          optionsMenuWidth={100}
        />
      </EntryItemWrapper>
    </Wrapper>
  );
};

export default PageItem;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.micro,
}));

const EntryItemWrapper = styled("div")(() => ({
  flex: 1,
}));

const PageCount = styled("div")(({ theme }) => ({
  minWidth: "17px",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

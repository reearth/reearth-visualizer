import { getFieldValue } from "@reearth/app/features/Visualizer/Crust/StoryPanel/utils";
import { TextInput } from "@reearth/app/lib/reearth-ui";
import { EntryItem } from "@reearth/app/ui/components";
import { isEmptyString } from "@reearth/app/utils/string";
import type { Page } from "@reearth/services/api/storytelling";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { useStoryPage } from "../context";

interface PageItemProps {
  storyPage: Page;
  dragHandleClassName?: string;
  isDragging?: boolean;
  pageCount?: number;
}

const PageItem: FC<PageItemProps> = ({
  storyPage,
  pageCount,
  dragHandleClassName,
  isDragging
}) => {
  const t = useT();
  const {
    selectedStoryPage,
    handleStoryPageSelect,
    handleStoryPageDelete,
    handlePropertyValueUpdate
  } = useStoryPage();

  const title = (getFieldValue(
    storyPage.property.items ?? [],
    "title",
    "title"
  ) ?? t("Untitled")) as string;
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
      localTitle
    );
  }, [
    handlePropertyValueUpdate,
    localTitle,
    storyPage.property.id,
    storyPage.property.items,
    storyPage.title
  ]);
  const optionsMenu = useMemo(
    () => [
      {
        id: "rename",
        title: t("Rename"),
        icon: "pencilSimple" as const,
        onClick: () => {
          // Delay entering edit mode until popup has fully closed and finished focus management
          setTimeout(() => {
            setEditingPageNameId(storyPage.id);
          }, 0);
        }
      },
      {
        id: "delete",
        title: t("Delete"),
        icon: "trash" as const,
        onClick: () => handleStoryPageDelete(storyPage.id)
      }
    ],
    [storyPage.id, handleStoryPageDelete, t]
  );

  return (
    <Wrapper>
      <PageCount>{pageCount}.</PageCount>
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
            <TitleWrapper
              onDoubleClick={() => setEditingPageNameId(storyPage.id)}
            >
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
    </Wrapper>
  );
};

export default PageItem;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.micro,
  width: "100%",
  overflowX: "hidden"
}));

const PageCount = styled("div")(({ theme }) => ({
  minWidth: "17px",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}));

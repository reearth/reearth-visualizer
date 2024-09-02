import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import { Icon } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useCallback } from "react";

import { usePanelContext } from "../../../context";
import { StoryBlock } from "../../../types";
import { getIconName } from "../../../utils";

const NextPage: FC<BlockProps<StoryBlock>> = ({
  block,
  pageId,
  isSelected,
  ...props
}) => {
  const { pageIds, onJumpToPage } = usePanelContext();

  const handlePageChange = useCallback(() => {
    if (!pageId) return;
    const pageIndex = pageIds?.findIndex((id) => id === pageId);
    if (pageIndex === undefined) return;
    onJumpToPage?.(pageIndex + 1);
  }, [pageId, pageIds, onJumpToPage]);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}
    >
      <Wrapper>
        <Button onClick={handlePageChange}>
          <StyledIcon icon={getIconName(block?.extensionId)} size="normal" />
        </Button>
      </Wrapper>
    </BlockWrapper>
  );
};

export default NextPage;

const Wrapper = styled("div")(() => ({
  display: "flex",
  width: "100%",
  justifyContent: "center"
}));

const StyledIcon = styled(Icon)(() => ({
  transition: "none"
}));

const Button = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: `${theme.spacing.smallest}px ${theme.spacing.normal}px`,
  border: "1px solid #2c2c2c",
  borderRadius: theme.radius.normal,
  transition: "none",
  cursor: "pointer",
  ["&:hover"]: {
    background: "#8d8d8d",
    border: "1px solid #8d8d8d",
    color: theme.content.strong
  }
}));

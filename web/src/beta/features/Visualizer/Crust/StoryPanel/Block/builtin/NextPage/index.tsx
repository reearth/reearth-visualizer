import { FC, useCallback } from "react";

import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import { Button } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { usePanelContext } from "../../../context";
import { StoryBlock } from "../../../types";
import { getIconName } from "../../../utils";

const NextPage: FC<BlockProps<StoryBlock>> = ({ block, pageId, isSelected, ...props }) => {
  const { pageIds, onJumpToPage } = usePanelContext();

  const theme = useTheme();
  const handlePageChange = useCallback(() => {
    if (!pageId) return;
    const pageIndex = pageIds?.findIndex(id => id === pageId);
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
      {...props}>
      <Wrapper>
        <Button
          icon={getIconName(block?.extensionId)}
          iconButton
          iconColor={theme.content.strong}
          onClick={handlePageChange}
        />
      </Wrapper>
    </BlockWrapper>
  );
};

export default NextPage;

const Wrapper = styled("div")(() => ({
  display: "flex",
  width: "100%",
  justifyContent: "center",
}));

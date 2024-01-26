import { useCallback } from "react";

import Icon from "@reearth/beta/components/Icon";
import BlockWrapper from "@reearth/beta/lib/core/shared/components/BlockWrapper";
import type { CommonProps as BlockProps } from "@reearth/beta/lib/core/StoryPanel/Block/types";
import { styled } from "@reearth/services/theme";

import { usePanelContext } from "../../../context";

const NextPage: React.FC<BlockProps> = ({ block, pageId, isSelected, ...props }) => {
  const { pageIds, onJumpToPage } = usePanelContext();

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
        <Button onClick={handlePageChange}>
          <StyledIcon icon={block?.extensionId} size={16} />
        </Button>
      </Wrapper>
    </BlockWrapper>
  );
};

export default NextPage;

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

const StyledIcon = styled(Icon)`
  transition: none;
`;

const Button = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 12px;
  border: 1px solid #2c2c2c;
  border-radius: 6px;
  transition: none;
  cursor: pointer;

  :hover {
    background: #8d8d8d;
    border: 1px solid #8d8d8d;
    color: ${({ theme }) => theme.content.strong};
  }
`;

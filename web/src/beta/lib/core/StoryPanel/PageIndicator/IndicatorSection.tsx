import { useCallback, useMemo, useState } from "react";

import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

type Props = {
  title?: string;
  pageNumber: number;
  currentPageNumber: number;
  onPageChange: (page: number) => void;
};

const IndicatorSection: React.FC<Props> = ({
  pageNumber,
  currentPageNumber,
  title,
  onPageChange,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseOut = useCallback(() => setIsHovered(false), []);

  const handleClick = useCallback(() => {
    onPageChange(pageNumber);
    setIsHovered(false);
  }, [pageNumber, onPageChange]);

  const isHighlighted = useMemo(
    () => pageNumber <= currentPageNumber,
    [currentPageNumber, pageNumber],
  );

  // const isLast = useMemo(() => pageNumber === totalPages, [pageNumber, totalPages]);

  return (
    <Wrapper onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseOut}>
      <Popover.Provider open={isHovered} placement="bottom" offset={0} shift={{ padding: 0 }}>
        <Popover.Trigger asChild>
          <Indicator highlighted={isHighlighted} />
        </Popover.Trigger>
        <Popover.Content attachToRoot>
          <PageNameWrapper isHighlighted={isHighlighted}>
            <StyledText size="footnote" customColor>
              {title}
            </StyledText>
          </PageNameWrapper>
        </Popover.Content>
      </Popover.Provider>
    </Wrapper>
  );
};

export default IndicatorSection;

const Wrapper = styled.div`
  flex: 1;
  cursor: pointer;
  color: ${({ theme }) => theme.content.strong};

  :not(:first-of-type) {
    border-left: 1px solid #ffffff;
  }
`;

const Indicator = styled.div<{ highlighted: boolean }>`
  height: 100%;
  ${({ highlighted }) =>
    highlighted &&
    `
  background-color: #4589ff;
  width: 100%;
  `}
`;

const PageNameWrapper = styled.div<{ isHighlighted: boolean }>`
  background-color: #78a9ff;
  padding: 4px 8px;
  ${({ isHighlighted }) => isHighlighted && "background-color: #4589ff;"}
  max-width: 255px;
`;

const StyledText = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

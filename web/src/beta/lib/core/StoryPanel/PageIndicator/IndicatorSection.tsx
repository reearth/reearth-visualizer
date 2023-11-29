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

  return (
    <Wrapper onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseOut}>
      <Popover.Provider open={isHovered} offset={0}>
        <Popover.Trigger asChild>
          <Indicator highlighted={isHighlighted} />
        </Popover.Trigger>
        <Popover.Content attachToRoot>
          <PageNameWrapper isHighlighted={isHighlighted}>
            <Text size="footnote" customColor>
              {title}
            </Text>
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
  white-space: nowrap;
`;

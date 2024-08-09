import { FC, useCallback, useMemo, useState } from "react";

import { Popup } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

type Props = {
  title?: string;
  pageNumber: number;
  currentPageNumber: number;
  onPageChange: (page: number) => void;
};

const IndicatorSection: FC<Props> = ({ pageNumber, currentPageNumber, title, onPageChange }) => {
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
    <Popup
      trigger={
        <Indicator
          highlighted={isHighlighted}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseOut}
          isFirstChild={pageNumber === 1}
        />
      }
      open={isHovered}
      placement="bottom"
      extendTriggerWidth>
      <PageNameWrapper isHighlighted={isHighlighted}>
        <TitleWrapper>{title}</TitleWrapper>
      </PageNameWrapper>
    </Popup>
  );
};

export default IndicatorSection;

const Indicator = styled("div")<{ highlighted: boolean; isFirstChild: boolean }>(
  ({ highlighted, isFirstChild, theme }) => ({
    height: "100%",
    width: "100%",
    background: highlighted ? theme.primary.strong : "#78a9ff",
    cursor: "pointer",
    borderLeft: !isFirstChild ? "1px solid #ffffff" : "none",
  }),
);

const PageNameWrapper = styled("div")<{ isHighlighted: boolean }>(({ isHighlighted, theme }) => ({
  background: isHighlighted ? theme.primary.strong : "#78a9ff",
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  maxWidth: "255px",
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.footnote,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

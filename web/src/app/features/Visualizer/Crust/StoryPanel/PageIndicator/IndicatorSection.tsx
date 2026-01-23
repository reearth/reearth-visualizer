import { Popup } from "@reearth/app/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

type Props = {
  title?: string;
  pageNumber: number;
  currentPageNumber: number;
  onPageChange: (page: number) => void;
};

const IndicatorSection: FC<Props> = ({
  pageNumber,
  currentPageNumber,
  title,
  onPageChange
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onPageChange(pageNumber);
    },
    [pageNumber, onPageChange]
  );

  const handleMouseEnter = useCallback(() => {
    setIsPopupOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPopupOpen(false);
  }, []);

  const isHighlighted = useMemo(
    () => pageNumber <= currentPageNumber,
    [currentPageNumber, pageNumber]
  );

  // const isLast = useMemo(() => pageNumber === totalPages, [pageNumber, totalPages]);
  return (
    <Popup
      trigger={
        <Indicator
          highlighted={isHighlighted}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          isFirstChild={pageNumber === 1}
        />
      }
      open={isPopupOpen}
      placement="bottom"
      extendTriggerWidth
    >
      <PageNameWrapper isHighlighted={isHighlighted}>
        <TitleWrapper>{title}</TitleWrapper>
      </PageNameWrapper>
    </Popup>
  );
};

export default IndicatorSection;

const Indicator = styled("div")<{
  highlighted: boolean;
  isFirstChild: boolean;
}>(({ highlighted, isFirstChild, theme }) => ({
  height: "100%",
  width: "100%",
  background: highlighted ? theme.primary.strong : "#78a9ff",
  cursor: "pointer",
  borderLeft: !isFirstChild ? "1px solid #ffffff" : "none"
}));

const PageNameWrapper = styled("div")<{ isHighlighted: boolean }>(
  ({ isHighlighted, theme }) => ({
    background: isHighlighted ? theme.primary.strong : "#78a9ff",
    padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
    maxWidth: "255px"
  })
);

const TitleWrapper = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.footnote,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  cursor: "default"
}));

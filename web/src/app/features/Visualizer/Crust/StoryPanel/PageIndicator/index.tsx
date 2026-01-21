import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import IndicatorSection from "./IndicatorSection";

type Props = {
  currentPage: number;
  pageTitles?: string[];
  maxPage: number;
  onPageChange: (page: number) => void;
};

const StoryPageIndicator: FC<Props> = ({
  currentPage,
  pageTitles,
  maxPage,
  onPageChange
}) => {
  const t = useT();
  return (
    <Wrapper>
      {[...Array(maxPage)].map((_, i) => {
        return (
          <IndicatorSection
            key={i}
            pageNumber={i + 1}
            currentPageNumber={currentPage}
            title={pageTitles?.[i] ?? t("Untitled")}
            onPageChange={onPageChange}
          />
        );
      })}
    </Wrapper>
  );
};

export default StoryPageIndicator;

const Wrapper = styled("div")(() => ({
  display: "flex",
  height: "8px"
}));

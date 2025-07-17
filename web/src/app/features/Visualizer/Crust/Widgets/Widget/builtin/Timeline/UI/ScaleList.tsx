import { Typography } from "@reearth/app/lib/reearth-ui";
import { PublishTheme, styled } from "@reearth/services/theme";
import { memo } from "react";

import {
  EPOCH_SEC,
  STRONG_SCALE_WIDTH,
  NORMAL_SCALE_WIDTH,
  PADDING_HORIZONTAL
} from "./constants";
import { formatDateForTimeline } from "./utils";

type Props = {
  publishedTheme?: PublishTheme;
  gapHorizontal: number;
} & ScaleListInnerProps;

const ScaleList: React.FC<Props> = ({
  publishedTheme,
  gapHorizontal,
  ...props
}) => {
  return (
    <ScaleContainer style={{ gap: `0 ${gapHorizontal}px` }}>
      <ScaleListInner publishedTheme={publishedTheme} {...props} />
    </ScaleContainer>
  );
};

type ScaleListInnerProps = {
  publishedTheme?: PublishTheme;
  start: Date;
  scaleCount: number;
  hoursCount: number;
  scaleInterval: number;
  strongScaleMinutes: number;
};

const ScaleListInner: React.FC<ScaleListInnerProps> = memo(
  function ScaleListPresenter({
    publishedTheme,
    start,
    scaleCount,
    hoursCount,
    scaleInterval,
    strongScaleMinutes
  }) {
    const lastStrongScaleIdx = scaleCount - strongScaleMinutes;
    return (
      <>
        {[...Array(scaleCount + 1)].map((_, idx) => {
          const isHour = idx % hoursCount === 0;
          const isStrongScale = idx % strongScaleMinutes === 0;
          if (isStrongScale && idx < lastStrongScaleIdx) {
            const label = formatDateForTimeline(
              start.getTime() + idx * EPOCH_SEC * scaleInterval,
              {
                detail: true
              }
            );

            return (
              <LabeledScale key={idx}>
                <ScaleLabel size="footnote" publishedTheme={publishedTheme}>
                  {label}
                </ScaleLabel>
                <Scale
                  isHour={isHour}
                  isStrongScale={isStrongScale}
                  publishedTheme={publishedTheme}
                />
              </LabeledScale>
            );
          }
          return (
            <Scale
              key={idx}
              isHour={isHour}
              isStrongScale={isStrongScale}
              publishedTheme={publishedTheme}
            />
          );
        })}
      </>
    );
  }
);

export type StyledColorProps = {
  publishedTheme: PublishTheme | undefined;
};

const ScaleContainer = styled("div")(({ theme }) => ({
  display: "flex",
  width: 0,
  alignItems: "flex-end",
  willChange: "auto",
  height: "30px",
  paddingLeft: `${PADDING_HORIZONTAL}px`,
  "&::after": {
    content: '""',
    display: "block",
    paddingRight: theme.spacing.micro - 1,
    height: "1px"
  }
}));

const LabeledScale = styled("div")({
  display: "flex",
  alignItems: "flex-end",
  position: "relative",
  height: "100%"
});

const ScaleLabel = styled(Typography)<StyledColorProps>(
  ({ publishedTheme, theme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    whiteSpace: "nowrap",
    color: publishedTheme?.mainText || theme.content.main
  })
);

const Scale = styled("div")<
  StyledColorProps & {
    isHour: boolean;
    isStrongScale: boolean;
  }
>(({ isStrongScale, isHour, publishedTheme }) => ({
  flexShrink: 0,
  width: isStrongScale ? `${STRONG_SCALE_WIDTH}px` : `${NORMAL_SCALE_WIDTH}px`,
  height: isHour ? "16px" : "12px",
  background: publishedTheme?.weakText
}));

export default ScaleList;

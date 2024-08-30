import Text from "@reearth/beta/components/Text";
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
                <ScaleLabel
                  size="footnote"
                  customColor
                  publishedTheme={publishedTheme}
                >
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

const ScaleContainer = styled.div`
  display: flex;
  width: 0;

  height: 30px;
  align-items: flex-end;
  will-change: auto;
  padding-left: ${PADDING_HORIZONTAL}px;
  ::after {
    content: "";
    display: block;
    padding-right: 1px;
    height: 1px;
  }
`;

const LabeledScale = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  height: 100%;
`;

const ScaleLabel = styled(Text)<StyledColorProps>`
  position: absolute;
  top: 0;
  left: 0;
  color: ${({ theme, publishedTheme }) =>
    publishedTheme?.mainText || theme.content.main};
  white-space: nowrap;
`;

const Scale = styled.div<
  StyledColorProps & {
    isHour: boolean;
    isStrongScale: boolean;
  }
>`
  flex-shrink: 0;
  width: ${({ isStrongScale }) =>
    isStrongScale ? `${STRONG_SCALE_WIDTH}px` : `${NORMAL_SCALE_WIDTH}px`};
  height: ${({ isHour }) => (isHour && "16px") || "12px"};
  background: ${({ publishedTheme }) => publishedTheme?.weakText};
`;

export default ScaleList;

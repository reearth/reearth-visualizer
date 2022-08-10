import { memo } from "react";

import Text from "@reearth/components/atoms/Text";
import { styled } from "@reearth/theme";

import { EPOCH_SEC, STRONG_SCALE_WIDTH, NORMAL_SCALE_WIDTH, PADDING_HORIZONTAL } from "./constants";
import { formatDateForTimeline } from "./utils";

type Props = {
  gapHorizontal: number;
} & ScaleListInnerProps;

const ScaleList: React.FC<Props> = ({ gapHorizontal, ...props }) => {
  return (
    <ScaleContainer style={{ gap: `0 ${gapHorizontal}px` }}>
      <ScaleListInner {...props} />
    </ScaleContainer>
  );
};

type ScaleListInnerProps = {
  start: Date;
  scaleCount: number;
  hoursCount: number;
  scaleInterval: number;
  strongScaleHours: number;
};

const ScaleListInner: React.FC<ScaleListInnerProps> = memo(function ScaleListPresenter({
  start,
  scaleCount,
  hoursCount,
  scaleInterval,
  strongScaleHours,
}) {
  const strongHours = hoursCount * strongScaleHours;
  const lastStrongScaleIdx = strongHours * (scaleCount / strongHours);
  return (
    <>
      {[...Array(scaleCount + 1)].map((_, idx) => {
        const isHour = idx % hoursCount === 0;
        const isStrongScale = idx % strongHours === 0;
        if (isStrongScale && idx !== lastStrongScaleIdx) {
          const label = formatDateForTimeline(start.getTime() + idx * EPOCH_SEC * scaleInterval);

          return (
            <LabeledScale key={idx}>
              <ScaleLabel size="xs">{label}</ScaleLabel>
              <Scale isHour={isHour} isStrongScale={isStrongScale} />
            </LabeledScale>
          );
        }
        return <Scale key={idx} isHour={isHour} isStrongScale={isStrongScale} />;
      })}
    </>
  );
});

const ScaleContainer = styled.div`
  display: flex;
  min-width: 100%;
  height: 30px;
  align-items: flex-end;
  will-change: auto;
  padding-left: ${PADDING_HORIZONTAL}px;
  ::after {
    content: "";
    display: block;
    padding-right: ${PADDING_HORIZONTAL}px;
    height: 1px;
  }
`;

const LabeledScale = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  height: 100%;
`;

const ScaleLabel = styled(Text)`
  position: absolute;
  top: 0;
  left: 0;
  color: ${({ theme }) => theme.colors.publish.dark.text.main};
  white-space: nowrap;
`;

const Scale = styled.div<{
  isHour: boolean;
  isStrongScale: boolean;
}>`
  flex-shrink: 0;
  width: ${({ isStrongScale }) =>
    isStrongScale ? `${STRONG_SCALE_WIDTH}px` : `${NORMAL_SCALE_WIDTH}px`};
  height: ${({ isHour }) => (isHour && "16px") || "12px"};
  background: ${({ theme }) => theme.colors.publish.dark.text.weak};
`;

export default ScaleList;

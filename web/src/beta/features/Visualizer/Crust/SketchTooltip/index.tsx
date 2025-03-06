import { Typography } from "@reearth/beta/lib/reearth-ui";
import { SketchFeatureTooltip } from "@reearth/beta/utils/sketch";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type SketchTooltipProp = {
  sketchFeatureTooltip?: SketchFeatureTooltip;
};

const SketchTooltip: FC<SketchTooltipProp> = ({ sketchFeatureTooltip }) => {
  if (!sketchFeatureTooltip?.description) return null;

  const BOLD_WORDS = ["Drag", "Click", "Select", "Right click", "Double click", "Delete"];

  // Split text into parts and wrap bold words with <strong>
  const formattedText = sketchFeatureTooltip.description.split(/(\bDrag\b|\bClick\b|\bSelect\b|\bRight click\b|\bDouble click\b|\bDelete\b)/g)
    .map((word, index) =>
      BOLD_WORDS.includes(word) ? (
        <Typography key={index} size="body" weight="bold">
          {word}
        </Typography>
      ) : (
        <Typography key={index} size="body">
          {word}
        </Typography>
      )
    );

  return (
    <Wrapper>
      {formattedText}
    </Wrapper>
  );
};

export default SketchTooltip;

const Wrapper = styled("div")(({ theme }) => ({
  position: "absolute",
  top: "6px",
  left: "6px",
  minHeight: "70px",
  background: theme.bg[0],
  borderRadius: theme.radius.smallest,
  color: theme.content.main,
  maxWidth: "250px",
  padding: theme.spacing.normal,
  boxSizing: "border-box",
  display: "flex",
  flexWrap: "wrap",
  gap: "2px"
}));

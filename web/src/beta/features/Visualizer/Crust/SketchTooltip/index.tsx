import { Typography } from "@reearth/beta/lib/reearth-ui";
import { SketchFeatureTooltip } from "@reearth/beta/utils/sketch";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type SketchTooltipProp = {
  sketchFeatureTooltip?: SketchFeatureTooltip;
};

const BOLD_WORDS = [
  "Drag",
  "Drop",
  "Click",
  "Left click",
  "Right click",
  "Double click",
  "Select",
  "Delete",
  "ESC"
];

const formatText = (text: string) =>
  text
    .split(new RegExp(`(${BOLD_WORDS.join("|")})`, "g"))
    .map((word, i) =>
      BOLD_WORDS.includes(word) ? <strong key={i}>{word}</strong> : word
    );

const SketchTooltip: FC<SketchTooltipProp> = ({ sketchFeatureTooltip }) => {
  if (!sketchFeatureTooltip?.description) return null;

  return (
    <Wrapper>
      {sketchFeatureTooltip.description.split("\n").map((line, i) => (
        <Typography key={i} size="body">
          {formatText(line)}
        </Typography>
      ))}
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
  padding: theme.spacing.normal,
  boxSizing: "border-box"
}));

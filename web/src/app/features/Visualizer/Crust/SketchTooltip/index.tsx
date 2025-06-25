import { Typography } from "@reearth/app/lib/reearth-ui";
import { SketchFeatureTooltip } from "@reearth/app/utils/sketch";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type SketchTooltipProp = {
  sketchFeatureTooltip?: SketchFeatureTooltip;
};

const boldWords = [
  "Drag",
  "Drop",
  "Click",
  "Right click",
  "Double click",
  "Select",
  "Delete",
  "Enter",
  "ESC",
  "ドラッグ",
  "ドロップ",
  "クリック",
  "右クリック",
  "ダブルクリック",
  "選択"
];

const formatText = (text: string) =>
  text
    .split(new RegExp(`(${boldWords.join("|")})`, "g"))
    .map((word, i) =>
      boldWords.includes(word) ? <strong key={i}>{word}</strong> : word
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
  zIndex: theme.zIndexes.visualizer.sketchLayerTooltip,
  boxSizing: "border-box"
}));

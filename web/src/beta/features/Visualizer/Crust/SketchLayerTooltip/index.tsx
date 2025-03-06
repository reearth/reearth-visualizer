import { Typography } from "@reearth/beta/lib/reearth-ui";
import { SketchLayerTooltipInfo } from "@reearth/beta/utils/sketch";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type SketchLayerTooltipProp = {
  sketchLayerTooltipInfo?: SketchLayerTooltipInfo;
};
const SketchLayerTooltip: FC<SketchLayerTooltipProp> = ({
  sketchLayerTooltipInfo
}) => {
  return (
    sketchLayerTooltipInfo && (
      <Wrapper>
        <Typography size="body" weight="bold">
          {sketchLayerTooltipInfo?.description}
        </Typography>
      </Wrapper>
    )
  );
};

export default SketchLayerTooltip;

const Wrapper = styled("div")(({ theme }) => ({
  position: "absolute",
  top: "6px",
  left: "6px",
  minHeight: "70px",
  background: theme.bg[0],
  borderRadius: theme.radius.smallest,
  color: theme.content.main,
  minWidth: "216px",
  maxWidth: "275px",
  padding: theme.spacing.normal,
  boxSizing: "border-box"
}));

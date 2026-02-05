import { Icon } from "@reearth/app/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { getIconName } from "../utils";

type Props = {
  icon?: string;
  height?: number;
};

const Template: FC<Props> = ({ icon, height }) => {
  return (
    <Wrapper height={height}>
      <StyledIcon icon={getIconName(icon)} />
    </Wrapper>
  );
};

export default Template;

const Wrapper = styled("div")<{ height?: number }>(({ height }) => ({
  display: "flex",
  height: height ? `${height}px` : "255px",
  justifyContent: "center",
  alignItems: "center",
  flex: 1,
  backgroundColor: "#e0e0e0",
  color: "#a8a8a8"
}));

const StyledIcon = styled(Icon)(() => ({
  width: "32px",
  height: "32px"
}));

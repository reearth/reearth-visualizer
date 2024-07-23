import { FC } from "react";

import { Icon } from "@reearth/beta/lib/reearth-ui/components/Icon/index";
import { styled } from "@reearth/services/theme";

export type CheckBoxProps = {
  checked?: boolean;
};

const CheckBox: FC<CheckBoxProps> = ({ checked = false }) => {
  return <BoxField>{checked && <CheckMark icon="check" />}</BoxField>;
};

const BoxField = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  width: "20px",
  height: "20px",
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: "4px",
}));

const CheckMark = styled(Icon)(({ theme }) => ({
  color: theme.content.main,
}));

export default CheckBox;

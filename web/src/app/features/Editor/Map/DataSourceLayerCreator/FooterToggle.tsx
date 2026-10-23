import { Switcher, Typography } from "@reearth/app/lib/reearth-ui";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

type Props = {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  "data-testid"?: string;
};

// A labelled switch for a layer creator modal's footer, with its description
// shown in a tooltip on the info icon.
const FooterToggle: FC<Props> = ({
  label,
  description,
  value,
  onChange,
  "data-testid": dataTestid
}) => (
  <Wrapper>
    <Label>
      <Tooltip
        type="custom"
        icon="informationCircle"
        placement="bottom"
        text={description}
      />
      <Typography size="body">{label}</Typography>
    </Label>
    <Switcher value={value} onChange={onChange} data-testid={dataTestid} />
  </Wrapper>
);

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.large
}));

const Label = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest
}));

export default FooterToggle;

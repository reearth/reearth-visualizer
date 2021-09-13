import React from "react";
import { useIntl } from "react-intl";

import Text from "@reearth/components/atoms/Text";
import ToggleButton from "@reearth/components/atoms/ToggleButton";
import { styled } from "@reearth/theme";

export type Props = {
  checked?: boolean;
  onChange?: () => Promise<void> | undefined;
};

const WidgetToggleButton: React.FC<Props> = props => {
  const intl = useIntl();
  return (
    <ToggleWrapper>
      <Text size="xs">{intl.formatMessage({ defaultMessage: "Enable" })}</Text>
      <ToggleButton {...props} />
    </ToggleWrapper>
  );
};

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 16px 16px 0 16px;
  justify-content: space-between;
`;

export default WidgetToggleButton;

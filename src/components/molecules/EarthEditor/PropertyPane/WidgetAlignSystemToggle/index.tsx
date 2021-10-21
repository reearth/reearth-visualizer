import React from "react";
import { useIntl } from "react-intl";

import Text from "@reearth/components/atoms/Text";
import ToggleButton from "@reearth/components/atoms/ToggleButton";
import { styled } from "@reearth/theme";

export type Props = {
  checked?: boolean;
  onChange?: () => Promise<void> | void;
};

const WidgetAlignSystemToggle: React.FC<Props> = ({ checked, onChange }) => {
  const intl = useIntl();
  return (
    <ToggleWrapper>
      <Text size="xs" otherProperties={{ userSelect: "none" }}>
        {intl.formatMessage({ defaultMessage: "Enable Editor Mode" })}
      </Text>
      <ToggleButton checked={checked} onChange={onChange} />
    </ToggleWrapper>
  );
};

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 16px 16px 0 16px;
  justify-content: space-between;
`;

export default WidgetAlignSystemToggle;

import React from "react";

import { useT } from "@reearth/beta/services/i18n";
import { styled } from "@reearth/beta/services/theme";
import Text from "@reearth/classic/components/atoms/Text";
import ToggleButton from "@reearth/classic/components/atoms/ToggleButton";

export type Props = {
  checked?: boolean;
  onChange?: () => Promise<void> | void;
};

const WidgetAlignSystemToggle: React.FC<Props> = ({ checked, onChange }) => {
  const t = useT();
  return (
    <ToggleWrapper>
      <Text size="xs" otherProperties={{ userSelect: "none" }}>
        {t("Enable Editor Mode")}
      </Text>
      <ToggleButton checked={checked} onChange={onChange} />
    </ToggleWrapper>
  );
};

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 16px;
  justify-content: space-between;
`;

export default WidgetAlignSystemToggle;

import React from "react";

import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  title?: string;
  currentWorkspace?: {
    name: string;
    personal?: boolean;
  };
  currentProject?: string;
  onChange?: (name: string) => void;
};

const SettingsHeader: React.FC<Props> = ({ title, currentWorkspace, currentProject }) => {
  const t = useT();
  const workspace = currentWorkspace?.name;
  const theme = useTheme();

  return (
    <Wrapper>
      <Text size="xl" color={theme.main.strongText} weight="normal">
        {workspace} {workspace && (title || currentProject) && " / "}
        {currentProject} {title && currentProject && " / "}
        {title}
      </Text>
      <Text size="m" color={theme.main.text} otherProperties={{ marginTop: "12px" }}>
        {currentWorkspace?.personal && t("(Your personal workspace)")}
      </Text>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: ${metricsSizes["l"]}px 0;
`;

export default SettingsHeader;

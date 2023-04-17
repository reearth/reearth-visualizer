import { useCallback, useState } from "react";

import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import Policy from "@reearth/components/molecules/Common/Policy";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  title?: string;
  currentWorkspace?: {
    name: string;
    personal?: boolean;
    policy?: {
      id: string;
      name: string;
    } | null;
  };
  currentProject?: string;
  onChange?: (name: string) => void;
};

const SettingsHeader: React.FC<Props> = ({ title, currentWorkspace, currentProject }) => {
  const t = useT();
  const theme = useTheme();

  const { name: workspaceName, policy } = currentWorkspace ?? {};

  const [policyModalOpen, setPolicyModal] = useState(false);

  const handlePolicyModalOpen = useCallback(() => setPolicyModal(true), []);

  const handlePolicyModalClose = useCallback(() => setPolicyModal(false), []);

  return (
    <Wrapper>
      <Flex gap={12} align="center">
        <Text size="xl" color={theme.main.strongText} weight="bold">
          {workspaceName} {workspaceName && (title || currentProject) && " / "}
          {currentProject} {currentProject && title && " / "}
          {title}
        </Text>
        {policy && !currentProject && !title && (
          <Policy
            policy={policy}
            modalOpen={policyModalOpen}
            onModalOpen={handlePolicyModalOpen}
            onModalClose={handlePolicyModalClose}
          />
        )}
      </Flex>
      {currentWorkspace?.personal && (
        <Text size="m" color={theme.main.text} otherProperties={{ marginTop: "12px" }}>
          {t("(Your personal workspace)")}
        </Text>
      )}
    </Wrapper>
  );
};

export default SettingsHeader;

const Wrapper = styled.div`
  padding: ${metricsSizes["l"]}px 0;
`;

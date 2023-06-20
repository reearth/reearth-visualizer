import { useCallback, useState } from "react";

import Flex from "@reearth/classic/components/atoms/Flex";
import Text from "@reearth/classic/components/atoms/Text";
import Policy from "@reearth/classic/components/molecules/Common/Policy";
import { metricsSizes } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

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
        <Text size="xl" color={theme.classic.main.strongText} weight="bold">
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
        <Text size="m" color={theme.classic.main.text} otherProperties={{ marginTop: "12px" }}>
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

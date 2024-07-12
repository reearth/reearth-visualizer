import { ReactNode } from "react";

import Divider from "@reearth/beta/components/Divider";
import Flex from "@reearth/beta/components/Flex";
import Text from "@reearth/beta/components/Text";
import { metricsSizes } from "@reearth/beta/utils/metrics";
import { styled, useTheme } from "@reearth/services/theme";

export type Props = {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

const Section: React.FC<Props> = ({ title, subtitle, actions, children }) => {
  const theme = useTheme();
  return (
    <div>
      {title && (
        <>
          <SectionHeader justify="space-between">
            <Flex direction="column">
              <Text size="l" weight="normal" color={theme.classic.main.strongText}>
                {title}
              </Text>
              {subtitle && (
                <Text
                  size="s"
                  weight="normal"
                  color={theme.classic.main.text}
                  otherProperties={{ marginTop: metricsSizes["2xs"] + "px" }}>
                  {subtitle}
                </Text>
              )}
            </Flex>
            {actions}
          </SectionHeader>
          <Divider margin="0" />
        </>
      )}
      <SectionItem direction="column">{children}</SectionItem>
    </div>
  );
};

const SectionHeader = styled(Flex)`
  padding: ${metricsSizes["l"]}px ${metricsSizes["2xl"]}px;
`;

const SectionItem = styled(Flex)`
  padding: ${metricsSizes["l"]}px ${metricsSizes["2xl"]}px;
`;

export default Section;

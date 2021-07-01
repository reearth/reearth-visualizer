import React from "react";
import { styled, useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  title?: string;
  actions?: React.ReactNode;
};

const Section: React.FC<Props> = ({ title, actions, children }) => {
  const theme = useTheme();
  return (
    <div>
      {title && (
        <>
          <SectionHeader>
            <Text size="l" weight="normal" color={theme.main.strongText}>
              {title}
            </Text>
            {actions}
          </SectionHeader>
          <Divider />
        </>
      )}
      <SectionItem>{children}</SectionItem>
    </div>
  );
};

const SectionHeader = styled.div`
  padding: ${metricsSizes["l"]}px ${metricsSizes["2xl"]}px;
  display: flex;
  justify-content: space-between;
`;

const SectionItem = styled.div`
  padding: ${metricsSizes["l"]}px ${metricsSizes["2xl"]}px;
  display: flex;
  flex-direction: column;
`;

const Divider = styled.div`
  border-bottom: ${props => `solid 1px ${props.theme.colors.outline.weak}`};
`;

export default Section;

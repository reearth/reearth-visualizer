import React from "react";
import Field from "@reearth/components/molecules/Settings/Field";
import { styled, useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";

export type Props = {
  title?: string;
  actions?: React.ReactNode;
};

const Section: React.FC<Props> = ({ title, actions, children }) => {
  const theme = useTheme();
  return (
    <Wrapper>
      {title && (
        <>
          <SectionHeader>
            <Text
              size="l"
              weight="normal"
              color={theme.main.strongText}
              otherProperties={{ flex: 1 }}>
              {title}
            </Text>
            {actions}
          </SectionHeader>
          <Divider />
        </>
      )}
      <SectionItem>
        <Field>{children}</Field>
      </SectionItem>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 100%;
`;

const SectionHeader = styled.h4`
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
`;

const SectionItem = styled.div`
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid #3f3d45;
`;

export default Section;

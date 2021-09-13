import React from "react";
import { useIntl } from "react-intl";

import Section from "@reearth/components/molecules/Settings/Section";
import { styled } from "@reearth/theme";

const ArchivedMessage: React.FC = () => {
  const intl = useIntl();

  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Notice" })}>
        <Description>
          {intl.formatMessage({
            defaultMessage:
              "Most project settings are hidden when the project is archived. Please unarchive the project to view and edit these settings.",
          })}
        </Description>
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.main.lighterBg};
`;

const Description = styled.p``;

export default ArchivedMessage;

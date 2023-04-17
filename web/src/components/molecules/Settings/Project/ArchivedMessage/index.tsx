import React from "react";

import Section from "@reearth/components/molecules/Settings/Section";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

const ArchivedMessage: React.FC = () => {
  const t = useT();

  return (
    <Wrapper>
      <Section title={t("Notice")}>
        <Description>
          {t(
            "Most project settings are hidden when the project is archived. Please unarchive the project to view and edit these settings.",
          )}
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

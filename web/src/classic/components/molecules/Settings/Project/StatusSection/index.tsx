import React, { useMemo } from "react";

import PublicationStatus, { Status } from "@reearth/classic/components/atoms/PublicationStatus";
import Text from "@reearth/classic/components/atoms/Text";
import Field from "@reearth/classic/components/molecules/Settings/Field";
import Section from "@reearth/classic/components/molecules/Settings/Section";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

export type Props = {
  projectStatus?: Status;
};

const StatusSection: React.FC<Props> = ({ projectStatus }) => {
  const t = useT();
  const theme = useTheme();

  const Message = useMemo(() => {
    return projectStatus === "published"
      ? t("This project is published with search engine indexing enabled.")
      : projectStatus === "limited"
      ? t("This project is published with search engine indexing disabled.")
      : t("This project is not published.");
  }, [t, projectStatus]);

  return (
    <Wrapper>
      <Section>
        <Field
          body={
            <PublicationStatus status={projectStatus} size="lg" color={theme.classic.main.text} />
          }
        />
        <Field body={<Text size="m">{Message}</Text>} />
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${props => props.theme.classic.main.lighterBg};
`;

export default StatusSection;

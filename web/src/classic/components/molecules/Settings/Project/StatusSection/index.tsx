import React, { useMemo } from "react";

import { useT } from "@reearth/beta/services/i18n";
import { styled, useTheme } from "@reearth/beta/services/theme";
import PublicationStatus, { Status } from "@reearth/classic/components/atoms/PublicationStatus";
import Text from "@reearth/classic/components/atoms/Text";
import Field from "@reearth/classic/components/molecules/Settings/Field";
import Section from "@reearth/classic/components/molecules/Settings/Section";

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
          body={<PublicationStatus status={projectStatus} size="lg" color={theme.main.text} />}
        />
        <Field body={<Text size="m">{Message}</Text>} />
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${props => props.theme.main.lighterBg};
`;

export default StatusSection;

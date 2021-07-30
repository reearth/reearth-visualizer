import React, { useMemo } from "react";
import PublicationStatus, { Status } from "@reearth/components/atoms/PublicationStatus";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import { useIntl } from "react-intl";
import Section from "@reearth/components/molecules/Settings/Section";
import Field from "@reearth/components/molecules/Settings/Field";

export type Props = {
  projectStatus?: Status;
};

const StatusSection: React.FC<Props> = ({ projectStatus }) => {
  const intl = useIntl();
  const theme = useTheme();

  const Message = useMemo(() => {
    return projectStatus === "published"
      ? intl.formatMessage({
          defaultMessage: "This project is published with search engine indexing enabled.",
        })
      : projectStatus === "limited"
      ? intl.formatMessage({
          defaultMessage: "This project is published with search engine indexing disabled.",
        })
      : intl.formatMessage({ defaultMessage: "This project is not published." });
  }, [intl, projectStatus]);

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

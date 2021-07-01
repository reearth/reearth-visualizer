import { styled } from "@reearth/theme";
import React from "react";
import { useIntl } from "react-intl";
import Section from "../../Section";
import EditableItem from "../EditableItem";
import ToggleItem from "../ToggleItem";

export type Props = {
  onSave: (active?: boolean, basicAuthUsername?: string, basicAuthPassword?: string) => void;
  isBasicAuthActive?: boolean;
  basicAuthUsername?: string;
  basicAuthPassword?: string;
};

const BasicAuthSection: React.FC<Props> = ({
  onSave,
  isBasicAuthActive,
  basicAuthUsername,
  basicAuthPassword,
}) => {
  const intl = useIntl();
  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Basic Authorization" })}>
        <ToggleItem
          title={intl.formatMessage({ defaultMessage: "Enable basic authorization" })}
          checked={!!isBasicAuthActive}
          onChange={() => onSave(!isBasicAuthActive, basicAuthUsername, basicAuthPassword)}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Username" })}
          body={basicAuthUsername}
          multilineTextBox={false}
          onSubmit={username => onSave(isBasicAuthActive, username, basicAuthPassword)}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Password" })}
          body={basicAuthPassword}
          multilineTextBox={false}
          onSubmit={password => onSave(isBasicAuthActive, basicAuthUsername, password)}
        />
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.bg[3]};
`;

export default BasicAuthSection;

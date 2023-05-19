import React from "react";

import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

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
  const t = useT();
  return (
    <Wrapper>
      <Section title={t("Basic Authorization")}>
        <ToggleItem
          title={t("Enable basic authorization")}
          checked={!!isBasicAuthActive}
          onChange={() => onSave(!isBasicAuthActive, basicAuthUsername, basicAuthPassword)}
        />
        <EditableItem
          title={t("Username")}
          body={basicAuthUsername}
          multilineTextBox={false}
          onSubmit={username => onSave(isBasicAuthActive, username, basicAuthPassword)}
        />
        <EditableItem
          title={t("Password")}
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
  background-color: ${({ theme }) => theme.main.lighterBg};
`;

export default BasicAuthSection;

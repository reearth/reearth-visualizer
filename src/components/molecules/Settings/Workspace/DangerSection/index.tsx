import React, { useState } from "react";
import Section from "@reearth/components/molecules/Settings/Section";
import Field from "@reearth/components/molecules/Settings/Field";
import Button from "@reearth/components/atoms/Button";
import Modal from "./Modal";
import { styled } from "@reearth/theme";
import { useIntl } from "react-intl";

export type Props = {
  team?: {
    id: string;
    name: string;
  };
  deleteTeam?: () => void;
};

const DangerSection: React.FC<Props> = ({ team, deleteTeam }) => {
  const [isOpen, setIsOpen] = useState(false);

  const intl = useIntl();
  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Danger Zone" })}>
        <Field header={intl.formatMessage({ defaultMessage: "Delete this workspace" })} />
        <Field
          body={intl.formatMessage({
            defaultMessage: `Once you delete a workspace, there is no going back. Please be certain.`,
          })}
          action={
            <Button
              large
              text={intl.formatMessage({ defaultMessage: "Delete workspace" })}
              buttonType="danger"
              onClick={() => setIsOpen(true)}
            />
          }
        />
      </Section>
      <Modal
        team={team}
        isVisible={isOpen}
        deleteTeam={deleteTeam}
        onClose={() => setIsOpen(false)}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.bg[3]};
  border: 1px solid #ff3c53;
`;

export default DangerSection;

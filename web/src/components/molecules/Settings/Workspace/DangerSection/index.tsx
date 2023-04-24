import React, { useState } from "react";

import Button from "@reearth/components/atoms/Button";
import Field from "@reearth/components/molecules/Settings/Field";
import Section from "@reearth/components/molecules/Settings/Section";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

import Modal from "./Modal";

export type Props = {
  workspace?: {
    id: string;
    name: string;
  };
  deleteWorkspace?: () => void;
};

const DangerSection: React.FC<Props> = ({ workspace, deleteWorkspace }) => {
  const [isOpen, setIsOpen] = useState(false);

  const t = useT();
  return (
    <Wrapper>
      <Section title={t("Danger Zone")}>
        <Field header={t("Delete this workspace")} />
        <Field
          body={t(`Once you delete a workspace, there is no going back. Please be certain.`)}
          action={
            <Button
              large
              text={t("Delete workspace")}
              buttonType="danger"
              onClick={() => setIsOpen(true)}
            />
          }
        />
      </Section>
      <Modal
        workspace={workspace}
        isVisible={isOpen}
        deleteWorkspace={deleteWorkspace}
        onClose={() => setIsOpen(false)}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.main.lighterBg};
  border: 1px solid #ff3c53;
`;

export default DangerSection;

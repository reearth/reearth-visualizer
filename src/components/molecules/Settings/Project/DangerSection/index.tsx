import React, { useState } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Field from "@reearth/components/molecules/Settings/Field";
import Section from "@reearth/components/molecules/Settings/Section";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import Modal, { ActionType } from "./Modal";

export type Props = {
  project?: {
    id: string;
    name: string;
    isArchived: boolean;
  };
  teamId?: string;
  archiveProject?: (archived: boolean) => void;
  deleteProject?: () => void;
};

const DangerSection: React.FC<Props> = ({ project, teamId, archiveProject, deleteProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>("archive");

  const openModal = (modalType: ActionType) => {
    setActionType(modalType);
    setIsOpen(true);
  };

  const intl = useIntl();
  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Danger Zone" })}>
        {/* <Field header={intl.formatMessage({ defaultMessage: "Transfer ownership" })} />
        <Field
          body={intl.formatMessage({
            defaultMessage: `Transfer this project to another user or to an organization where you have the ability to create repositories.`,
          })}
          action={
            <RedButton
              text={intl.formatMessage({ defaultMessage: "Transfer" })}
              buttonType="bordered"
              isRadius
              // onClick={handleTransfer}
              width="124px"
              height="33px"
            />
          }
        />
        <Divider /> */}
        <Field
          header={
            project?.isArchived
              ? intl.formatMessage({ defaultMessage: "Unarchive this project" })
              : intl.formatMessage({ defaultMessage: "Archive this project" })
          }
        />
        <Field
          body={
            project?.isArchived
              ? intl.formatMessage({
                  defaultMessage: "Unarchive this project to become editable again.",
                })
              : intl.formatMessage({
                  defaultMessage: "Mark this project as archived and read-only",
                })
          }
          action={
            <Button
              large
              text={
                project?.isArchived
                  ? intl.formatMessage({ defaultMessage: "Unarchive project" })
                  : intl.formatMessage({ defaultMessage: "Archive project" })
              }
              onClick={() => openModal(project?.isArchived ? "unarchive" : "archive")}
              buttonType="danger"
            />
          }
        />
        <Divider />
        <Field header={intl.formatMessage({ defaultMessage: "Delete this project" })} />
        <Field
          body={intl.formatMessage({
            defaultMessage: `Once you delete a project, there is no going back. Please be sure.`,
          })}
          action={
            <Button
              large
              text={intl.formatMessage({ defaultMessage: "Delete project" })}
              buttonType="danger"
              onClick={() => openModal("delete")}
            />
          }
        />
      </Section>
      <Modal
        actionType={actionType}
        project={project}
        teamId={teamId}
        isVisible={isOpen}
        archiveProject={archiveProject}
        deleteProject={deleteProject}
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

const Divider = styled.div`
  width: 100%;
  margin-bottom: ${metricsSizes["2xl"]}px;
  border-bottom: 2px solid #3f3d45;
`;

export default DangerSection;

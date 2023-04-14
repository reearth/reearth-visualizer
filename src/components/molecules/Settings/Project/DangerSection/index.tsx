import React, { useState } from "react";

import Button from "@reearth/components/atoms/Button";
import Field from "@reearth/components/molecules/Settings/Field";
import Section from "@reearth/components/molecules/Settings/Section";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import Modal, { ActionType } from "./Modal";

export type Props = {
  project?: {
    id: string;
    name: string;
    isArchived: boolean;
  };
  workspaceId?: string;
  archiveProject?: (archived: boolean) => void;
  deleteProject?: () => void;
};

const DangerSection: React.FC<Props> = ({
  project,
  workspaceId,
  archiveProject,
  deleteProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>("archive");

  const openModal = (modalType: ActionType) => {
    setActionType(modalType);
    setIsOpen(true);
  };

  const t = useT();
  return (
    <Wrapper>
      <Section title={t("Danger Zone")}>
        {/* <Field header={t("Transfer ownership")} />
        <Field
          body={t(`Transfer this project to another user or to an organization where you have the ability to create repositories.`)}
          action={
            <RedButton
              text={t("Transfer")}
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
          header={project?.isArchived ? t("Unarchive this project") : t("Archive this project")}
        />
        <Field
          body={
            project?.isArchived
              ? t("Unarchive this project to become editable again.")
              : t("Mark this project as archived and read-only")
          }
          action={
            <Button
              large
              text={project?.isArchived ? t("Unarchive project") : t("Archive project")}
              onClick={() => openModal(project?.isArchived ? "unarchive" : "archive")}
              buttonType="danger"
            />
          }
        />
        <Divider />
        <Field header={t("Delete this project")} />
        <Field
          body={t(`Once you delete a project, there is no going back. Please be sure.`)}
          action={
            <Button
              large
              text={t("Delete project")}
              buttonType="danger"
              onClick={() => openModal("delete")}
            />
          }
        />
      </Section>
      <Modal
        actionType={actionType}
        project={project}
        workspaceId={workspaceId}
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

import { Button, Modal, ModalPanel } from "@reearth/app/lib/reearth-ui";
import { InputField, SelectField } from "@reearth/app/ui/fields";
import { useWorkspaceMutations } from "@reearth/services/api/workspace";
import { Role, WorkspaceMember } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { Workspace } from "@reearth/services/state";
import { FC, useCallback, useMemo, useState } from "react";

import { PermissionService } from "./PermissionService";

type UpdateRoleModalProps = {
  workspace: Workspace | undefined;
  member: WorkspaceMember;
  visible: boolean;
  onClose: () => void;
  meRole: Role | undefined;
};

const UpdateRoleModal: FC<UpdateRoleModalProps> = ({
  workspace,
  member,
  visible,
  onClose,
  meRole
}) => {
  const t = useT();

  const roleOptions = useMemo(() => {
    if (!meRole || !t) return [];
    return PermissionService.getRoleOptions(t, meRole);
  }, [meRole, t]);

  const [localRole, setLocalRole] = useState(member.role);

  const { updateMemberOfWorkspace } = useWorkspaceMutations();

  const handleUpdateRole = useCallback(async () => {
    if (!workspace?.id || !member.user?.id || !localRole) return;
    await updateMemberOfWorkspace({
      workspaceId: workspace.id,
      userId: member.user.id,
      role: localRole
    });
    onClose();
  }, [
    workspace?.id,
    member.user?.id,
    localRole,
    updateMemberOfWorkspace,
    onClose
  ]);

  return (
    <Modal visible={visible} size="small">
      <ModalPanel
        title={t("Update Member Role")}
        layout="common"
        onCancel={onClose}
        actions={[
          <Button
            key="cancel"
            title={t("Cancel")}
            appearance="secondary"
            onClick={onClose}
          />,
          <Button
            key="add"
            title={t("Update")}
            appearance="primary"
            onClick={handleUpdateRole}
          />
        ]}
      >
        <InputField
          title={t("User Name")}
          value={member.user?.name}
          appearance="readonly"
          disabled
        />
        <SelectField
          title={t("Role")}
          options={roleOptions}
          value={member.role}
          onChange={(r) => setLocalRole(r as Role)}
        />
      </ModalPanel>
    </Modal>
  );
};

export default UpdateRoleModal;

import React, { useCallback } from "react";

import Avatar from "@reearth/classic/components/atoms/Avatar";
import Flex from "@reearth/classic/components/atoms/Flex";
import Icon from "@reearth/classic/components/atoms/Icon";
import { metricsSizes } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import EditableItem from "../../Project/EditableItem";

export type Role = "READER" | "WRITER" | "MAINTAINER" | "OWNER";

type user = {
  id?: string;
  name?: string;
  email?: string;
};
export type Props = {
  user: user;
  role: Role;
  owner?: boolean;
  isMe?: boolean;
  personal?: boolean;
  onChangeRole: (role: Role) => void;
  onRemove: () => void;
};

const MemberListItem: React.FC<Props> = ({ user, role, owner, isMe, onChangeRole, onRemove }) => {
  const t = useT();
  const saveEdit = useCallback(
    (role?: string) => {
      if (!role) return;
      onChangeRole(role as Role);
    },
    [onChangeRole],
  );

  const roles = [
    { key: "READER", label: t("Reader") },
    { key: "WRITER", label: t("Writer") },
    { key: "MAINTAINER", label: t("Maintainer") },
    { key: "OWNER", label: t("Owner") },
  ];

  const editable = owner && !isMe;

  return (
    <Wrapper align="flex-start" justify="space-between">
      <StyleAvatar innerText={user.name} />

      <StyledEditableItem
        title={user.name}
        subtitle={user.email}
        dropdown
        dropdownItems={roles}
        currentItem={role}
        body={roles.find(r => r.key === role)?.label}
        onSubmit={saveEdit}
        disabled={!editable}
      />
      {editable && <StyledIcon icon="bin" size={20} onClick={onRemove} />}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  width: 100%;
  height: 100px;
  padding-right: ${metricsSizes["l"]}px;
  color: ${({ theme }) => theme.classic.properties.contentsText};
`;

const StyledEditableItem = styled(EditableItem)`
  width: 100%;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
  margin-left: ${metricsSizes["l"]}px;
`;

const StyleAvatar = styled(Avatar)`
  margin-right: ${metricsSizes["m"]}px;
`;

export default MemberListItem;

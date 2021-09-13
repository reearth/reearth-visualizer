import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";

import Icon from "@reearth/components/atoms/Icon";
import Select, { Props as SelectProps } from "@reearth/components/atoms/Select";
import Option from "@reearth/components/atoms/SelectOption";
import Text from "@reearth/components/atoms/Text";
import Avatar from "@reearth/components/molecules/Settings/Avatar";
import Field from "@reearth/components/molecules/Settings/Field";
import { styled } from "@reearth/theme";

export type Role = "READER" | "WRITER" | "OWNER";

export type Props = {
  name?: string;
  role: Role;
  owner?: boolean;
  isMyself?: boolean;
  personal?: boolean;
  onChangeRole: (role: Role) => void;
  onRemove: () => void;
};

const MemberListItem: React.FC<Props> = ({ name, role, owner, onChangeRole, onRemove }) => {
  const [isEditting, setIsEditting] = useState(false);
  const [roleState, setRoleState] = useState(role as string);
  const intl = useIntl();

  const startEdit = useCallback(() => setIsEditting(true), [setIsEditting]);
  const cancelEdit = useCallback(() => setIsEditting(false), [setIsEditting]);

  const saveEdit = useCallback(() => {
    onChangeRole(roleState as Role);
    setIsEditting(false);
  }, [onChangeRole, setIsEditting, roleState]);

  const HandleChange = useCallback((r: string) => {
    setRoleState(r);
  }, []);

  const roles = [
    { key: "READER", label: intl.formatMessage({ defaultMessage: "Reader" }) },
    { key: "WRITER", label: intl.formatMessage({ defaultMessage: "Writer" }) },
    { key: "OWNER", label: intl.formatMessage({ defaultMessage: "Owner" }) },
  ];

  return (
    <Wrapper>
      <StyledAvatar size={30} />
      <FlexItemLg>
        {isEditting ? (
          <Field
            header={name}
            action={
              <ButtonWrapper>
                <StyledIcon icon="cancel" size={20} onClick={cancelEdit} />
                <StyledIcon icon="check" size={20} onClick={saveEdit} />
              </ButtonWrapper>
            }>
            <SelectFieldWrapper>
              <StyledSelect value={roleState} onChange={HandleChange}>
                {roles.map(({ key, label }) => (
                  <Option key={key} value={key} label={label}>
                    <OptionCheck size="xs">
                      {key === roleState && <Icon icon="check" size={13} />}
                    </OptionCheck>
                    {label}
                  </Option>
                ))}
              </StyledSelect>
            </SelectFieldWrapper>
          </Field>
        ) : (
          <Field
            header={name}
            body={roles.find(r => r.key === role)?.label}
            action={
              owner === true && role !== "OWNER" ? (
                <StyledIcon icon="edit" size={20} onClick={startEdit} />
              ) : (
                <Filler />
              )
            }
          />
        )}
      </FlexItemLg>
      <FlexItemSm>
        {owner === true && role !== "OWNER" && (
          <StyledIcon icon="bin" size={20} onClick={onRemove} />
        )}
      </FlexItemSm>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 80px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SelectFieldWrapper = styled.div`
  width: 70%;
`;

const StyledSelect = styled(Select as React.ComponentType<SelectProps<string>>)`
  height: 40px;
`;

const OptionCheck = styled(Text)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  margin-right: 6px;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 14px;
`;

const FlexItemLg = styled.div`
  max-width: 90%;
`;

const FlexItemSm = styled.div`
  flex-grow: 1;
  margin-right: 15px;
`;

const StyledIcon = styled(Icon)`
  width: 25px;
  height: 25px;
  padding: 0;
  margin-left: 15px;
  cursor: pointer;
`;

const Filler = styled.div`
  min-width: 40px;
`;

export default MemberListItem;

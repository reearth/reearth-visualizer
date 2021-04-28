import React, { useState, useCallback } from "react";
import Field from "@reearth/components/molecules/Settings/Field";
import TextBox from "@reearth/components/atoms/TextBox";
import SelectField from "@reearth/components/molecules/Settings/SelectField";
import Icon from "@reearth/components/atoms/Icon";
import { styled, colors } from "@reearth/theme";

export type Props = {
  className?: string;
  title?: React.ReactNode;
  body?: string;
  dropdown?: boolean;
  dropdownItems?:
    | {
        key: string;
        label: string;
        icon?: string | undefined;
      }[]
    | undefined;
  currentItem?: string;
  image?: string;
  icon?: string;
  iHeight?: string;
  multilineTextBox?: boolean;
  onSubmit?: (body: string) => void;
};

const EditableItem: React.FC<Props> = ({
  className,
  title,
  body = "",
  dropdown,
  dropdownItems,
  currentItem,
  multilineTextBox,
  image,
  icon,
  iHeight,
  onSubmit,
}) => {
  const [isEditting, setIsEditting] = useState(false);
  const [inputState, setInputState] = useState(body || currentItem);

  const startEdit = useCallback(() => setIsEditting(true), [setIsEditting]);
  const cancelEdit = useCallback(() => setIsEditting(false), [setIsEditting]);

  const saveEdit = useCallback(() => {
    inputState && onSubmit?.(inputState);
    setIsEditting(false);
  }, [inputState, onSubmit, setIsEditting]);

  return isEditting ? (
    dropdown ? (
      <Field
        className={className}
        header={title}
        action={
          <ButtonWrapper>
            <StyledIcon icon="cancel" size={20} onClick={cancelEdit} />
            <StyledIcon icon="check" size={20} onClick={saveEdit} />
          </ButtonWrapper>
        }>
        <SelectFieldWrapper>
          <SelectField value={inputState} items={dropdownItems} onChange={setInputState} />
        </SelectFieldWrapper>
      </Field>
    ) : (
      <Field
        className={className}
        header={title}
        action={
          <ButtonWrapper>
            <StyledIcon icon="cancel" size={20} onClick={cancelEdit} />
            <StyledIcon icon="check" size={20} onClick={saveEdit} />
          </ButtonWrapper>
        }>
        <TextBox
          onChange={setInputState}
          floatedTextColor="white"
          borderColor="#3f3d45"
          value={body}
          multiline={multilineTextBox}
        />
      </Field>
    )
  ) : (
    <Field
      className={className}
      header={title}
      body={body}
      action={<StyledIcon icon="edit" size={20} onClick={startEdit} />}>
      {image ? (
        <div>
          <Image src={image} height={iHeight} />
        </div>
      ) : (
        icon && (
          <div>
            <Icon icon={icon} size={iHeight} />
          </div>
        )
      )}
    </Field>
  );
};

const StyledIcon = styled(Icon)`
  padding: 0;
  margin-left: 15px;
  cursor: pointer;

  &:hover {
    color: ${colors.text.strong};
  }
`;

const SelectFieldWrapper = styled.div`
  width: 70%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Image = styled.img`
  max-width: 100%;
`;

export default EditableItem;

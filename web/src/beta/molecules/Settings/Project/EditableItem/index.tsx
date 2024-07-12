import React, { useState, useCallback } from "react";

import Avatar from "@reearth/beta/components/Avatar";
import Icon from "@reearth/beta/components/Icon";
import defaultProjectImage from "@reearth/beta/components/Icon/Icons/defaultProjectImage.jpg";
import TextBox from "@reearth/beta/components/TextBox";
import Field from "@reearth/beta/molecules/Settings/Field";
import SelectField from "@reearth/beta/molecules/Settings/SelectField";
import { metricsSizes } from "@reearth/beta/utils/metrics";
import { styled } from "@reearth/services/theme";

export type Props<T extends string = string> = {
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  body?: T;
  dropdown?: boolean;
  isImage?: boolean;
  dropdownItems?:
  | {
    key: T;
    label: string;
    icon?: string | undefined;
  }[]
  | undefined;
  currentItem?: T;
  imageSrc?: string;
  icon?: string;
  avatar?: string;
  iHeight?: string;
  multilineTextBox?: boolean;
  disabled?: boolean;
  onSubmit?: (body: T | undefined) => void;
  onEditStart?: () => void;
  onEditCancel?: () => void;
};

export default function EditableItem<T extends string = string>({
  className,
  title,
  subtitle,
  body,
  dropdown,
  isImage,
  dropdownItems,
  currentItem,
  multilineTextBox,
  imageSrc,
  icon,
  iHeight,
  disabled,
  avatar,
  onSubmit,
  onEditStart,
  onEditCancel,
}: Props<T>): JSX.Element | null {
  const [isEditting, setIsEditting] = useState(false);
  const [inputState, setInputState] = useState(currentItem || body);

  const startEdit = useCallback(() => {
    if (onEditStart) {
      onEditStart();
    } else {
      setIsEditting(true);
    }
  }, [setIsEditting, onEditStart]);

  const cancelEdit = useCallback(() => {
    if (onEditCancel) {
      onEditCancel();
    } else {
      setIsEditting(false);
    }
  }, [setIsEditting, onEditCancel]);

  const saveEdit = useCallback(() => {
    inputState && onSubmit?.(inputState);
    setIsEditting(false);
  }, [inputState, onSubmit, setIsEditting]);

  return isEditting && !disabled ? (
    dropdown ? (
      <Field
        className={className}
        header={title}
        subHeader={subtitle}
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
        subHeader={subtitle}
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
      subHeader={subtitle}
      body={body}
      action={
        !disabled &&
        !avatar && (
          <ButtonWrapper>
            {imageSrc && <StyledIcon icon="bin" size={20} onClick={() => onSubmit?.(undefined)} />}
            <StyledIcon icon="edit" size={20} onClick={startEdit} />
          </ButtonWrapper>
        )
      }>
      {imageSrc || isImage ? (
        <div>
          <Image src={imageSrc || defaultProjectImage} height={iHeight} />
        </div>
      ) : avatar ? (
        <Avatar size="large" innerText={avatar} />
      ) : (
        icon && (
          <div>
            <Icon icon={icon} size={iHeight} />
          </div>
        )
      )}
    </Field>
  );
}

const StyledIcon = styled(Icon)`
  padding: 0;
  margin-left: ${metricsSizes["l"]}px;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.classic.main.strongText};
  }
`;

const SelectFieldWrapper = styled.div`
  width: 200px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Image = styled.img`
  max-height: 800px;
  max-width: 480px;
  width: 75%;
`;

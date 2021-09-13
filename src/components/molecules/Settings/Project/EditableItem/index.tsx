import React, { useState, useCallback } from "react";

import Icon from "@reearth/components/atoms/Icon";
import TextBox from "@reearth/components/atoms/TextBox";
import defaultProjectImage from "@reearth/components/molecules/Dashboard/defaultProjectImage.jpg";
import Field from "@reearth/components/molecules/Settings/Field";
import SelectField from "@reearth/components/molecules/Settings/SelectField";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  className?: string;
  title?: React.ReactNode;
  body?: string;
  dropdown?: boolean;
  isImage?: boolean;
  dropdownItems?:
    | {
        key: string;
        label: string;
        icon?: string | undefined;
      }[]
    | undefined;
  currentItem?: string;
  imageSrc?: string;
  icon?: string;
  iHeight?: string;
  multilineTextBox?: boolean;
  onSubmit?: (body: string) => void;
  onEditStart?: () => void;
  onEditCancel?: () => void;
};

const EditableItem: React.FC<Props> = ({
  className,
  title,
  body = "",
  dropdown,
  isImage,
  dropdownItems,
  currentItem,
  multilineTextBox,
  imageSrc,
  icon,
  iHeight,
  onSubmit,
  onEditStart,
  onEditCancel,
}) => {
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
      action={
        <ButtonWrapper>
          {imageSrc && <StyledIcon icon="bin" size={20} onClick={() => onSubmit?.("")} />}
          <StyledIcon icon="edit" size={20} onClick={startEdit} />
        </ButtonWrapper>
      }>
      {imageSrc || isImage ? (
        <div>
          <Image src={imageSrc || defaultProjectImage} height={iHeight} />
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
  margin-left: ${metricsSizes["l"]}px;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.main.strongText};
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

export default EditableItem;

import React, { useCallback, useState } from "react";

import TextInput from "@reearth/beta/components/fields/common/TextInput";
import { styled } from "@reearth/services/theme";

import { dataTypes } from "..";
import {
  DeleteButton,
  HandleIcon,
  PropertyField,
  PropertyFieldContanier,
  SelectWrapper,
  StyledText,
} from "../../utils";

import { PropertyProps } from "./hooks";

type Props = {
  property: PropertyProps;
  onKeyChange: (newValue?: string) => void;
  onValueChange: (newValue?: string) => void;
  onRemovePropertyItem: () => void;
};

const PropertyItem: React.FC<Props> = ({
  property,
  onKeyChange,
  onValueChange,
  onRemovePropertyItem,
}) => {
  const [propertyName, setPropertyName] = useState<string>(property.key);
  const [dataType, setDataType] = useState<string>(property.value);
  const [isEditName, setIsEditName] = useState(false);
  const [isEditType, setIsEditType] = useState(false);

  const handleKeyChange = useCallback(
    (newValue: string) => {
      setPropertyName(newValue);
      onKeyChange(newValue);
      if (isEditName) setIsEditName(value => !value);
    },
    [isEditName, onKeyChange],
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      setDataType(newValue);
      onValueChange(newValue);
      if (isEditType) setIsEditType(value => !value);
    },
    [isEditType, onValueChange],
  );

  const handleDoubleClick = useCallback((field: string) => {
    if (field === "name") {
      setIsEditName(true);
    } else if (field === "type") {
      setIsEditType(true);
    }
  }, []);

  const handleOnBlur = useCallback(() => {
    setIsEditName(false);
  }, []);

  return (
    <PropertyFieldContanier>
      <PropertyField>
        <HandleIcon icon="dndHandle" size={24} />
        {propertyName.trim() === "" || isEditName ? (
          <StyledTextInput value={propertyName} onChange={handleKeyChange} onBlur={handleOnBlur} />
        ) : (
          <StyledText onDoubleClick={() => handleDoubleClick("name")} size="footnote">
            {propertyName}
          </StyledText>
        )}
      </PropertyField>
      <PropertyField
        style={{
          justifyContent: "space-between",
        }}>
        {dataType.trim() === "" || isEditType ? (
          <StyledSelect
            value={dataType}
            options={dataTypes.map(v => ({ key: v, label: v }))}
            attachToRoot
            onChange={handleValueChange}
          />
        ) : (
          <StyledText onDoubleClick={() => handleDoubleClick("type")} size="footnote">
            {dataType}
          </StyledText>
        )}

        <DeleteButton icon="trash" size={16} onClick={onRemovePropertyItem} />
      </PropertyField>
    </PropertyFieldContanier>
  );
};

export default PropertyItem;

const StyledSelect = styled(SelectWrapper)`
  margin-top: 0;
  padding: 8px 0;
`;

const StyledTextInput = styled(TextInput)`
  width: 100%;
  &:focus {
    border: 1px solid ${({ theme }) => theme.select.strong};
  }
`;

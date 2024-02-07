import SelectField from "@reearth/beta/components/fields/SelectField";
import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import generateRandomString from "@reearth/beta/utils/generate-random-string";
import { styled } from "@reearth/services/theme";

export const InputGroup: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => {
  return (
    <InputGroupWrapper>
      <Label>{label}</Label>
      {children}
      {description && <Description>{description}</Description>}
    </InputGroupWrapper>
  );
};

const InputGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.content.main};
`;

const Description = styled.div`
  font-size: 0.625rem;
  color: ${({ theme }) => theme.content.weak};
`;

export const Input = styled.input`
  flex: auto;
  background: transparent;
  border: 1px solid #777;
  border-radius: 4px;
  outline: none;
  padding: 5px 10px;
  color: ${props => props.theme.content.main};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: auto;
  ::placeholder {
    color: ${({ theme }) => theme.content.weaker};
  }
`;

export const AssetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ColJustifyBetween = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

export const SourceTypeWrapper = styled.div`
  display: flex;
  gap: 24px;
`;

export const RadioButtonLabel = styled.label`
  display: flex;
  align-items: center;

  span {
    font-size: 0.75rem;
  }
`;

export const SubmitWrapper = styled.div`
  margin-top: 24px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

export const TextArea = styled.textarea`
  flex: auto;
  background: transparent;
  border: 1px solid #777;
  border-radius: 4px;
  outline: none;
  resize: none;
  padding: 5px 10px;
  color: ${props => props.theme.content.main};
`;

export const LayerWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

export const DeleteLayerIcon = styled(Icon)<{ disabled?: boolean }>`
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  background: transparent;
  border: 1px solid #777;
  padding: 7px 6px;
  border-radius: 4px;
  outline: none;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)}; // Reduce opacity for disabled state
`;

export const AddLayerWrapper = styled.div`
  width: 100%;
  display: flex;
  margin-top: 5px;
  justify-content: flex-start;
`;

export const LayerStyleIcon = styled(Icon)`
  cursor: pointer;
  background: transparent;
  border: 1px solid #777;
  padding: 7px 6px;
  border-radius: 4px;
  outline: none;
`;

export const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
`;

export const AddButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;
export const SelectWrapper = styled(SelectField)`
  display: block;
  margin-top: 4px;
  width: 100%;
`;

export const PropertyList = styled.div`
  display: block;
  margin-top: 24px;
  border-radius: 4px;
  border: ${({ theme }) => `1px solid ${theme.outline.weak}`};
`;

export const PropertyListHeader = styled.div`
  display: flex;
  background: ${({ theme }) => theme.bg[2]};
  & > :first-child {
    border-right: ${({ theme }) => `1px solid ${theme.outline.weak}`};
  }
`;

export const StyledText = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 40%;
  padding: 8px 10px;
`;

export const PropertyContentWrapper = styled.div`
  display: block;
  margin-bottom: 100px;
`;

export const PropertyContent = styled.div`
  display: flex;
  border-bottom: ${({ theme }) => `1px solid ${theme.outline.weak}`};

  & > :first-child {
    border-right: ${({ theme }) => `1px solid ${theme.outline.weak}`};
  }
`;

export const DataTypeContent = styled.div`
  display: flex;
  width: 55%;
  justify-content: space-between;
  & > :first-child {
    border-right: ${({ theme }) => `1px solid ${theme.outline.weak}`};
  }
`;

export const DataTypeText = styled(Text)`
  width: 85%;
  padding: 8px 10px;
`;
export const DeleteDataType = styled(Icon)`
  cursor: pointer;
  outline: none;
  padding-top: 12px;
`;

export const generateTitle = (url: string, layerName?: string): string => {
  if (layerName && layerName.trim() !== "") return layerName;
  if (url.trim() !== "") {
    try {
      const urlObject = new URL(url);
      const pathParts = urlObject.pathname.split("/");
      const lastPart = pathParts.pop() || "";
      const fileName = lastPart.split(".")[0];
      return fileName;
    } catch (error) {
      console.error("Invalid URL", error);
    }
  }
  return generateRandomString(5);
};

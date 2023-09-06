import { styled } from "@reearth/services/theme";

export const InputGroup: React.FC<{
  label: string;
  description: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => {
  return (
    <InputGroupWrapper>
      <Label>{label}</Label>
      {children}
      <Description>{description}</Description>
    </InputGroupWrapper>
  );
};

const InputGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
`;

export const AssetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ColJustiftBetween = styled.div`
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
  padding: 5px 10px;
  color: ${props => props.theme.content.main};
  overflow: hidden;
`;

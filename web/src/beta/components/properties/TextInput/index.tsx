import { styled } from "@reearth/services/theme";

import Property from "..";

type Props = {
  name?: string;
  description?: string;
};

const TextInput: React.FC<Props> = ({ name, description }) => {
  return (
    <Property name={name} description={description}>
      <StyledInput />
    </Property>
  );
};

export default TextInput;

const StyledInput = styled.input`
  outline: none;
  background: ${({ theme }) => theme.bg[1]};
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;

  :focus {
    border-color: ${({ theme }) => theme.outline.main};
  }
`;

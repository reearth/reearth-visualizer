import { styled } from "@reearth/services/theme";

import Property from "..";
import Button from "../../Button";
import TextInput from "../common/TextInput";

export type Props = {
  name?: string;
  description?: string;
  value?: string;
  onChange?: (value?: string | undefined) => void;
};

const DateTimeField: React.FC<Props> = ({ name, description, value, onChange }) => {
  const datePlaceholder = "DD/MM/YYYY";
  const timePlaceholder = "00:00:00";
  return (
    <Property name={name} description={description}>
      <Wrapper>
        <TextInput value={value} placeholder={datePlaceholder} onChange={onChange} />
        <Button icon="calender" />
        <TextInput value={value} placeholder={timePlaceholder} onChange={onChange} />
        <Button icon="clock" />
      </Wrapper>
    </Property>
  );
};

export default DateTimeField;

const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
`;

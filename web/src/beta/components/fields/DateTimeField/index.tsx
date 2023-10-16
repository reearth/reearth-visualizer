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
  const datePlaceholder = "YYYY-MM-DD";
  const timePlaceholder = "00:00:00";
  return (
    <Property name={name} description={description}>
      <Wrapper>
        <TextInput value={value} placeholder={datePlaceholder} onChange={onChange} />
        <Button size="small" icon="calender" />
        <TextInput value={value} placeholder={timePlaceholder} onChange={onChange} />
        <Button size="small" icon="clock" />
      </Wrapper>
    </Property>
  );
};

export default DateTimeField;

const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
  gap: 4px;
`;

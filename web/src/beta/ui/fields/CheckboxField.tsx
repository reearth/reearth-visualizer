import { FC } from "react";

import CheckBox from "@reearth/beta/lib/reearth-ui/components/CheckBox";
import { styled } from "@reearth/services/theme";

import { EntryItem, EntryItemProps } from "../components";

import CommonField, { CommonFieldProps } from "./CommonField";

export type CheckBoxFieldProps = CommonFieldProps &
  EntryItemProps & {
    onClick?: (value: boolean) => void;
    checked?: boolean;
    isIcon?: boolean;
  };

const CheckBoxField: FC<CheckBoxFieldProps> = ({
  commonTitle,
  description,
  onClick,
  checked,
  title,
  isIcon,
}) => {
  const handleClick = () => {
    onClick?.(!checked);
  };

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <Field>
        <CheckBox checked={checked} onClick={handleClick} />
        <EntryItemWrapper>
          <EntryItem icon={isIcon ? "file" : undefined} title={title} disableHover={true} />
        </EntryItemWrapper>
      </Field>
    </CommonField>
  );
};

const Field = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 20px;
`;

const EntryItemWrapper = styled.div`
  width: auto;
`;

export default CheckBoxField;

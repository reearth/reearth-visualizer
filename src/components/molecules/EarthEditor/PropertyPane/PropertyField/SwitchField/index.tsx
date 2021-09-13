import React from "react";

import ToggleButton from "@reearth/components/atoms/ToggleButton";
import { styled } from "@reearth/theme";

import { FieldProps } from "../types";

export type Props = FieldProps<boolean>;

const SwitchField: React.FC<Props> = ({ value: checked, name, onChange, disabled }) => {
  return (
    <Wrapper>
      <ToggleButton disabled={disabled} checked={checked} onChange={onChange} label={name} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  vertical-align: middle;
`;

export default SwitchField;

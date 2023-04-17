import React from "react";

import ToggleButton from "@reearth/components/atoms/ToggleButton";

import Field from "../../Field";

export type Props = {
  checked: boolean;
  title: string;
  onChange?: () => void;
};

const ToggleItem: React.FC<Props> = ({ title, onChange, checked }) => {
  return <Field header={title} body={<ToggleButton checked={checked} onChange={onChange} />} />;
};

export default ToggleItem;

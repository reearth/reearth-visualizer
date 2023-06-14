import type { FC } from "react";

import useManageSwitchState, { SwitchField } from "../../hooks/useManageSwitchState/hooks";
import TabButton from "../TabButton";

type CustomField = {
  name: string;
};
type SwitchCustomField = SwitchField<CustomField>;

export type Props = {
  items: SwitchCustomField[];
  onChange?: (id: string) => void;
};
const SubTabButtonList: FC<Props> = ({ items, onChange }) => {
  const { handleActivate, fields } = useManageSwitchState({ fields: items });
  const handleClick = (id: string) => {
    handleActivate(id);
    onChange?.(id);
  };
  return (
    <>
      {fields.map((item, index) => (
        <TabButton
          key={index}
          label={item.name}
          selected={item.active}
          onClick={() => handleClick(item.id)}
        />
      ))}
    </>
  );
};
export default SubTabButtonList;

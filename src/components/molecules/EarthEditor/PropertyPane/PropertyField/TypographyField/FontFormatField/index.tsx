import React from "react";

import Check from "@reearth/components/atoms/Check";
import CheckGroup from "@reearth/components/atoms/CheckGroup";
import Icon from "@reearth/components/atoms/Icon";

const formatItems = [
  { key: "bold", icon: "bold" } as const,
  { key: "italic", icon: "italic" } as const,
  { key: "underline", icon: "underline" } as const,
];

export type FontFormatKey = "bold" | "italic" | "underline" | "link";

type Props = {
  className?: string;
  values?: FontFormatKey[];
  linked?: boolean;
  overridden?: boolean;
  disabled?: boolean;
  onChange?: (values: FontFormatKey[]) => void;
};

const FontFormatField: React.FC<Props> = ({
  className,
  values: selectedValues,
  linked,
  overridden,
  disabled,
  onChange,
}) => {
  const inactive = !!linked || !!overridden || !!disabled;

  return (
    <>
      <CheckGroup<FontFormatKey>
        className={className}
        values={selectedValues}
        inactive={inactive}
        onChange={onChange}>
        {formatItems.map(({ key, icon }) => (
          <Check key={key} value={key} linked={linked} overridden={overridden}>
            <Icon icon={icon} size={16} />
          </Check>
        ))}
      </CheckGroup>
    </>
  );
};

export default FontFormatField;

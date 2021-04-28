import React from "react";
import { styled } from "@reearth/theme";

import Icon from "@reearth/components/atoms/Icon";
import Select from "@reearth/components/atoms/Select";
import Option from "@reearth/components/atoms/SelectOption";
import Text from "@reearth/components/atoms/Text";

const sizes = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 36, 48, 60, 72] as const;

export type FontSize = typeof sizes[number];

const sizeItems = sizes.map(size => ({ key: size, label: size }));

type Props = {
  className?: string;
  value?: FontSize;
  items?: { key: string; label: string; icon?: string }[];
  linked?: boolean;
  overridden?: boolean;
  disabled?: boolean;
  onChange?: (value: FontSize) => void;
};

const FontSizeField: React.FC<Props> = ({
  className,
  value: selectedKey,
  linked,
  overridden,
  disabled,
  onChange,
}) => {
  const inactive = !!linked || !!overridden || !!disabled;

  return (
    <Select<FontSize>
      className={className}
      value={selectedKey}
      inactive={inactive}
      onChange={onChange}>
      {sizeItems.map(({ key, label }) => (
        <Option key={key} linked={linked} overridden={overridden} value={key} label={String(label)}>
          <OptionCheck size="xs">
            {key === selectedKey && <Icon icon="check" size={10} />}
          </OptionCheck>
          {label}
        </Option>
      ))}
    </Select>
  );
};

const OptionCheck = styled(Text)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  margin-right: 6px;
`;

export default FontSizeField;

import React from "react";

import Icon from "@reearth/components/atoms/Icon";
import Select from "@reearth/components/atoms/Select";
import { Option } from "@reearth/components/atoms/SelectOption";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

const sizes = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 36, 48, 60, 72] as const;

export type FontSize = (typeof sizes)[number];

const sizeItems = sizes.map(size => ({ key: size, label: size }));

type Props = {
  className?: string;
  value?: FontSize;
  items?: { key: string; label: string; icon?: string }[];
  color?: string;
  onChange?: (value: FontSize) => void;
};

const FontSizeField: React.FC<Props> = ({ className, value: selectedKey, color, onChange }) => {
  const t = useT();

  return (
    <Select<FontSize>
      className={className}
      value={selectedKey}
      onChange={onChange}
      placeholder={t("Font size")}
      color={color}>
      {sizeItems.map(({ key, label }) => (
        <Option key={key} value={key} label={String(label)}>
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

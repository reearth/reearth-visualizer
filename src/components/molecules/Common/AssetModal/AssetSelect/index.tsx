import React, { useState, useCallback } from "react";
import Text from "@reearth/components/atoms/Text";
import Icon from "@reearth/components/atoms/Icon";
import Flex from "@reearth/components/atoms/Flex";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Item<Value extends string | number = string> = {
  key: Value;
  label: string;
  icon?: string;
};

export type Props<Value extends string | number = string> = {
  value: Value;
  items: Item<Value>[];
  onChange?: (selected: Value) => void;
};

const AssetSelect = <Value extends string | number = string>({
  value,
  items,
  onChange,
}: Props<Value>) => {
  const theme = useTheme();
  const [hidden, setHidden] = useState(true);

  const handleChange = useCallback(
    key => {
      onChange?.(key);
      setHidden(false);
    },
    [onChange],
  );

  return (
    <Wrapper>
      <Selected align="center" justify="space-between" onClick={() => setHidden(!hidden)}>
        <StyledText size="xs" color={theme.main.text}>
          {items.find(i => i.key === value)?.label}
        </StyledText>
        <Icon icon="arrowDown" color={theme.main.text} size={9} />
      </Selected>
      <Options onClick={() => setHidden(!hidden)} hidden={hidden}>
        {items?.map(({ key, label }) => (
          <Item key={key} align="center" justify="space-between" onClick={() => handleChange(key)}>
            <ItemText size="xs">{label}</ItemText>
            {key === value && <Icon icon="check" size={14} />}
          </Item>
        ))}
      </Options>
    </Wrapper>
  );
};

export default AssetSelect;

const Wrapper = styled.div`
  position: relative;
  user-select: none;
  width: 100%;
`;

const Selected = styled(Flex)`
  padding: 6px ${metricsSizes["s"]}px;
  border: 1px solid ${({ theme }) => theme.properties.border};
  cursor: pointer;
  user-select: none;
`;

const StyledText = styled(Text)`
  margin-right: ${metricsSizes["xs"]}px;
`;

const Options = styled.div<{ hidden?: boolean }>`
  display: ${({ hidden }) => (hidden ? "none" : "block")};
  width: 100%;
  margin: ${metricsSizes["2xs"]}px 0 0 0;
  box-sizing: border-box;
  z-index: ${({ theme }) => theme.zIndexes["propertyFieldPopup"]};
  background: ${({ theme }) => theme.main.bg};
  border: 1px solid ${({ theme }) => theme.properties.border};
  position: absolute;
  cursor: pointer;
`;

const Item = styled(Flex)`
  padding: ${metricsSizes["xs"]}px ${metricsSizes["s"]}px;
  color: ${({ theme }) => theme.main.text};

  &:hover {
    background: ${({ theme }) => theme.main.lighterBg};
  }
`;

const ItemText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: break-word;
`;

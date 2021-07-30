import React, { Fragment } from "react";
import { useIntl } from "react-intl";
import Text from "@reearth/components/atoms/Text";
import Divider from "@reearth/components/atoms/Divider";

import { styled, css } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export interface Props {
  className?: string;
  items?: { id: string; name?: string; type?: string }[];
  selectableType?: string;
  selectedItem?: string;
  onSelect?: (id: string) => void;
}

const List: React.FC<Props> = ({ className, items, selectableType, onSelect, selectedItem }) => {
  const intl = useIntl();
  const sType = selectableType === "url" ? "string" : selectableType;
  const visibleItems =
    items?.filter(item => !sType || ("type" in item && item.type === sType)) ?? [];
  return (
    <Wrapper className={className}>
      {visibleItems.map(item => (
        <Fragment key={item.id}>
          <StyledText
            size="xs"
            customColor
            onClick={() => onSelect?.(item.id)}
            selected={item.id === selectedItem}>
            {item.name || item.id}
          </StyledText>
          <Divider margin="0" />
        </Fragment>
      ))}
      {visibleItems.length === 0 && (
        <NoContent>{intl.formatMessage({ defaultMessage: "No selectable items" })}</NoContent>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  flex: auto;
  overflow: auto;
`;

const StyledText = styled(Text)<{ disabled?: boolean; selected?: boolean }>`
  padding: ${metricsSizes["s"]}px;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  user-select: none;
  transition: background-color 0.1s ease;
  color: ${({ disabled, theme, selected }) =>
    disabled ? theme.text.pale : selected ? theme.main.strongText : theme.text.default};
  background-color: ${({ selected, theme }) => (selected ? theme.main.accent : null)};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  ${({ disabled, selected }) =>
    disabled || selected
      ? null
      : css`
          &:hover {
            background-color: #ffffff10;
          }
        `};
`;

const NoContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

export default List;

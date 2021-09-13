import React, { Fragment } from "react";
import { useIntl } from "react-intl";

import Divider from "@reearth/components/atoms/Divider";
import Text from "@reearth/components/atoms/Text";
import { styled } from "@reearth/theme";
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
  cursor: pointer;
  user-select: none;
  transition: background-color 0.1s ease;
  color: ${({ theme, selected }) => (selected ? theme.main.strongText : theme.text.default)};
  background-color: ${({ selected, theme }) => (selected ? theme.main.select : null)};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  &:hover {
    background-color: ${({ theme, selected }) => (selected ? "" : theme.main.bg)};
  }
`;

const NoContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

export default List;

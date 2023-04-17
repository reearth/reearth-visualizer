import React, { useCallback } from "react";

import { styled, useTheme } from "@reearth/theme";

import Box from "../Box";
import Flex from "../Flex";
import Icon from "../Icon";
import Text from "../Text";

export type Props = {
  id: string;
  label: string;
  className?: string;
  icon?: "bin" | "cancel";
  onRemove?: (id: string) => void;
};

const Tag: React.FC<Props> = ({ className, id, label, icon, onRemove }) => {
  const theme = useTheme();
  const handleRemove = useCallback(() => {
    onRemove?.(id);
  }, [onRemove, id]);
  return (
    <Wrapper align="center" justify="space-between" className={className}>
      <Text size="xs">{label}</Text>
      <Box m="xs">
        <IconWrapper align="center" onClick={handleRemove} testId="atoms-tag-event-trigger">
          <Icon
            icon={icon}
            color={theme.text.default}
            data-testid="atoms-tag-icon"
            alt="tag-icon"
            size={12}
          />
        </IconWrapper>
      </Box>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  box-shadow: ${({ theme }) =>
    `0px 4px 4px${theme.descriptionBalloon.shadowColor}`}; //TODO: don't use balloon's color
  padding: ${({ theme }) => `${theme.metrics.xs}px`};
  min-width: 60px;
  width: fit-content;
`;

const IconWrapper = styled(Flex)`
  cursor: pointer;
`;

export default Tag;

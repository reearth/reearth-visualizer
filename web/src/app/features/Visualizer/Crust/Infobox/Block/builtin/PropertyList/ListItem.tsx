import { Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

const ListItem: FC<{ index?: number; keyValue?: string; value?: string }> = ({
  index,
  keyValue,
  value
}) => {
  const theme = useTheme();
  return (
    <PropertyWrapper key={index} isEven={isEven(index ?? 0)}>
      <TextWrapper>
        <Typography size="body" color={theme.content.weaker}>
          {keyValue}
        </Typography>
      </TextWrapper>
      <TextWrapper>
        <Typography size="body" color={theme.content.weaker}>
          {value}
        </Typography>
      </TextWrapper>
    </PropertyWrapper>
  );
};

export default ListItem;

const PropertyWrapper = styled("div")<{ isEven?: boolean }>(
  ({ isEven, theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing.large,
    background: isEven ? "#F4F4F4" : "#ffffff",
    padding: `${theme.spacing.small}px ${theme.spacing.large}px`,
    boxSizing: "border-box",
    wordBreak: "break-word",
    width: "100%"
  })
);

const TextWrapper = styled("div")(() => ({
  flex: 1
}));

function isEven(number: number) {
  return !!(number % 2 === 0);
}

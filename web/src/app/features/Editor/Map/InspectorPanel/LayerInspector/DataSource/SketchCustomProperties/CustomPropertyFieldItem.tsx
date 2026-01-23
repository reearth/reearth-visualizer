import {
  Icon,
  IconButton,
  IconName,
  PopupMenu,
  PopupMenuItem
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode, MouseEvent, useCallback } from "react";

type CustomPropertyFieldItemProps = {
  title: string;
  icon?: IconName;
  actions?: ReactNode[];
  openCustomPropertySchema: () => void;
  onDeleteField: (val: string) => void;
};

const CustomPropertyFieldItem: FC<CustomPropertyFieldItemProps> = ({
  icon,
  title,
  openCustomPropertySchema,
  onDeleteField
}) => {
  const handleOptionsClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);
  const t = useT();

  const optionsMenu: PopupMenuItem[] = [
    {
      id: "edit",
      title: t("Edit Field"),
      icon: "pencilSimple" as const,
      onClick: openCustomPropertySchema
    },
    {
      id: "delete",
      title: t("Delete Field"),
      icon: "trash" as const,
      onClick: () => onDeleteField(title)
    }
  ];
  return (
    <Wrapper>
      {icon && (
        <IconWrapper>
          <Icon icon={icon} />
        </IconWrapper>
      )}
      <Title>{title}</Title>
      <Actions>
        {!!optionsMenu && (
          <OptionsWrapper onClick={handleOptionsClick}>
            <PopupMenu
              label={
                <IconButton
                  icon="dotsThreeVertical"
                  size="small"
                  appearance="simple"
                  tooltipText={t("More")}
                />
              }
              placement="bottom-start"
              menu={optionsMenu}
              width={110}
            />
          </OptionsWrapper>
        )}
      </Actions>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: theme.radius.smallest,
  background: theme.relative.light,
  padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  minHeight: "26px"
}));

const Title = styled("div")(({ theme }) => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest
}));

const OptionsWrapper = styled("div")(() => ({
  flexShrink: 0
}));

const IconWrapper = styled("div")(({ theme }) => ({
  flexShrink: 0,
  fontSize: 0,
  color: theme.content.main
}));
export default CustomPropertyFieldItem;

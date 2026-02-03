import {
  Button,
  IconButton,
  PopupMenu,
  PopupMenuItem
} from "@reearth/app/lib/reearth-ui";
import defaultProjectBackgroundImage from "@reearth/app/ui/assets/defaultProjectBackgroundImage.webp";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useState } from "react";

import { DeletedProject } from "../../../type";
import ProjectDeleteModal from "../ProjectDeleteModal";

type Prop = {
  project?: DeletedProject | null;
  disabled?: boolean;
  onProjectDelete: () => void;
  onProjectRecovery?: (projectId?: string) => void;
};
const RecycleBinItem: FC<Prop> = ({
  project,
  disabled,
  onProjectRecovery,
  onProjectDelete
}) => {
  const t = useT();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { projectVisibility } = appFeature();
  const theme = useTheme();

  const handleDeleteModalClose = useCallback(() => {
    setDeleteModalVisible(!deleteModalVisible);
  }, [deleteModalVisible]);

  const popupMenu: PopupMenuItem[] = [
    {
      id: "recover",
      title: t("Recover"),
      icon: "arrowCounterClockWise",
      onClick: () => project?.id && onProjectRecovery?.(project.id)
    },
    {
      id: "delete",
      title: t("Delete"),
      icon: "trash",
      onClick: handleDeleteModalClose
    }
  ];

  return project ? (
    <Card data-testid={`recycle-bin-item-${project.name}`}>
      <CardImage
        data-testid={`recycle-bin-item-image-${project.name}`}
        backgroundImage={project.imageUrl ?? defaultProjectBackgroundImage}
      >
        <ButtonWrapper
          data-testid={`recycle-bin-item-btn-wrapper-${project.name}`}
        >
          {projectVisibility && !!project.visibility && (
            <VisibilityButton
              visibility={project.visibility}
              data-testid={`recycle-bin-item-visibility-btn-${project.name}`}
            >
              {project?.visibility}
            </VisibilityButton>
          )}
          {project.starred && (
            <StarButtonWrapper
              isStarred
              data-testid={`recycle-bin-item-star-btn-wrapper-${project.name}`}
            >
              <IconButton
                size="normal"
                icon="starFilled"
                iconColor={theme.warning.main}
                appearance="simple"
                data-testid={`recycle-bin-item-star-btn-${project.name}`}
              />
            </StarButtonWrapper>
          )}
        </ButtonWrapper>
      </CardImage>
      <CardFooter data-testid={`recycle-bin-item-footer-${project?.name}`}>
        <CardTitleWrapper>
          <CardTitle data-testid={`recycle-bin-item-title-${project?.name}`}>
            {project?.name}
          </CardTitle>
        </CardTitleWrapper>
        <PopupMenu
          menu={popupMenu}
          label={
            <Button
              data-testid={`recycle-bin-item-menu-btn-${project?.name}`}
              icon="dotsThreeVertical"
              iconButton
              appearance="simple"
            />
          }
        />
      </CardFooter>
      {deleteModalVisible && (
        <ProjectDeleteModal
          isVisible={deleteModalVisible}
          disabled={disabled}
          projectName={project?.name || ""}
          onClose={handleDeleteModalClose}
          onProjectDelete={onProjectDelete}
          data-testid={`recycle-bin-item-${project?.name}`}
        />
      )}
    </Card>
  ) : null;
};

export default RecycleBinItem;

const Card = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  height: "220px",
  "@media (max-width: 567px)": {
    height: "171px"
  }
}));

const CardImage = styled("div")<{
  backgroundImage?: string | null;
}>(({ theme, backgroundImage }) => ({
  flex: 1,
  position: css.position.relative,
  background: backgroundImage ? `url(${backgroundImage}) center/cover` : "",
  backgroundColor: theme.bg[1],
  borderRadius: theme.radius.normal,
  boxSizing: css.boxSizing.borderBox,
  border: `1px solid transparent`
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small + 2,
  position: css.position.absolute,
  top: "10px",
  right: "10px",
  pointerEvents: css.pointerEvents.none
}));

const VisibilityButton = styled("div")<{ visibility?: string }>(
  ({ theme, visibility }) => ({
    background: theme.bg[0],
    color: visibility === "public" ? "#B1B1B1" : "#535353",
    borderRadius: theme.radius.normal,
    padding: `${theme.spacing.micro}px ${theme.spacing.small}px`,
    border: visibility === "public" ? `1px solid #B1B1B1` : `1px solid #535353`,
    fontSize: theme.fonts.sizes.body,
    height: "25px"
  })
);

const StarButtonWrapper = styled("div")<{
  isStarred: boolean;
}>(({ isStarred, theme }) => ({
  opacity: isStarred ? 1 : 0,
  background: isStarred ? theme.bg[1] : "transparent",
  borderRadius: isStarred ? theme.radius.smallest : "none",
  border: isStarred ? `1px solid ${theme.outline.weaker}` : "none",
  boxShadow: isStarred ? theme.shadow.button : "none"
}));

const CardFooter = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest,
  padding: `0 ${theme.spacing.smallest}`
}));

const CardTitleWrapper = styled("div")(() => ({
  flex: 1
}));

const CardTitle = styled("div")(({ theme }) => ({
  flex: "1",
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  display: "-webkit-box",
  WebkitBoxOrient: css.webkitBoxOrient.vertical,
  WebkitLineClamp: css.webkitLineClamp["1"],
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis,
  cursor: css.cursor.pointer
}));

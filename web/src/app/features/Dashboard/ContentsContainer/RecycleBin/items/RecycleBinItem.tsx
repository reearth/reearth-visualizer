import { Button, PopupMenu, PopupMenuItem } from "@reearth/app/lib/reearth-ui";
import defaultProjectBackgroundImage from "@reearth/app/ui/assets/defaultProjectBackgroundImage.webp";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { DeletedProject } from "../../../type";
import ProjectDeleteModal from "../ProjectDeleteModal";

type Prop = {
  project?: DeletedProject;
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
  const [isHovered, setIsHovered] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleProjectHover = useCallback((value: boolean) => {
    setIsHovered(value);
  }, []);

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

  return (
    <Card data-testid={`recycle-bin-item-${project?.name}`}>
      <CardImage
        data-testid={`recycle-bin-item-image-${project?.name}`}
        backgroundImage={project?.imageUrl ?? defaultProjectBackgroundImage}
        isHovered={isHovered ?? false}
        onMouseEnter={() => handleProjectHover(true)}
        onMouseLeave={() => handleProjectHover(false)}
      />
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
  );
};

export default RecycleBinItem;

const Card = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "220px",
  "@media (max-width: 567px)": {
    height: "171px"
  }
});

const CardImage = styled("div")<{
  backgroundImage?: string | null;
  isHovered: boolean;
}>(({ theme, backgroundImage, isHovered }) => ({
  flex: 1,
  position: "relative",
  background: backgroundImage ? `url(${backgroundImage}) center/cover` : "",
  backgroundColor: theme.bg[1],
  borderRadius: theme.radius.normal,
  boxSizing: "border-box",
  cursor: "pointer",
  border: `1px solid ${isHovered ? theme.outline.weak : "transparent"}`
}));

const CardFooter = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
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
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  cursor: "pointer"
}));

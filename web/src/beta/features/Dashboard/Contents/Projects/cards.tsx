import { FC, useCallback, useState } from "react";

import { Button, PopupMenu, PopupMenuItem, TextInput } from "@reearth/beta/lib/reearth-ui";
// import useDoubleClick from "@reearth/beta/utils/use-double-click";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { Project } from "../../type";

export type CardProps = {
  project: Project;
  onClick?: () => void;
  onUpdateProject: (project: Project, projectId: string) => void;
};

export const Cards: FC<CardProps> = ({ project, onClick, onUpdateProject }) => {
  const t = useT();

  const [disabled, setDisabled] = useState(true);
  const [value, setValue] = useState(project.name);

  const handleRename = useCallback(() => {
    setDisabled(false);
  }, []);

  const popupMenu: PopupMenuItem[] = [
    {
      id: "rename",
      title: t("Rename"),
      icon: "pencilLine",
      onClick: handleRename,
    },

    {
      id: "setting",
      title: t("Project Setting"),
      path: `/settings/project/${project.id}`,
      icon: "setting",
    },
  ];

  const handleOnChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const handleOnBlur = useCallback(() => {
    if (!project || value === project.name) return setDisabled(true);
    const updatedProject: Project = {
      ...project,
      name: value,
    };
    onUpdateProject(updatedProject, project.id);
    setDisabled(true);
  }, [project, value, onUpdateProject]);

  //   const [isEditing, setIsEditing] = useState(false);

  //   const [, handleDoubleClick] = useDoubleClick(
  //     () => {},
  //     () => setIsEditing(true),
  //   );

  return (
    <Card>
      <CardImage backgroundImage={project.imageUrl} onClick={onClick} />
      <CardTitle>
        <TextInput
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          value={value}
          disabled={disabled}
          appearance="present"
        />
        <CardActions>
          <PopupMenu
            menu={popupMenu}
            label={<Button icon="dotsThreeVertical" iconButton appearance="simple" />}
          />
        </CardActions>
      </CardTitle>
    </Card>
  );
};

const Card = styled("div")(() => ({
  flex: "1 1 calc(25% - 10px)",
  height: "auto",
  maxWidth: "calc(25% - 10px)",
  "@media only screen and (max-width: 1200px)": {
    flex: "1 1 calc(33.33% - 10px)",
    maxWidth: "calc(33.33% - 10px)",
  },
  "@media only screen and (max-width: 900px)": {
    flex: "1 1 calc(50% - 10px)",
    maxWidth: "calc(50% - 10px)",
  },
  "@media only screen and (max-width: 600px)": {
    flex: "1 1 calc(50% - 10px)",
    maxWidth: "calc(50% - 10px)",
  },
}));

const CardImage = styled("div")<{ backgroundImage?: string | null }>(
  ({ theme, backgroundImage }) => ({
    background: backgroundImage ? `url(${backgroundImage}) center/cover` : theme.bg[1],
    borderRadius: theme.radius.normal,
    height: "171px",
    cursor: "pointer",
  }),
);

const CardTitle = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const CardActions = styled("div")(() => ({}));

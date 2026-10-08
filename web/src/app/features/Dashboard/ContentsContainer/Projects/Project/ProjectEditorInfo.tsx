import { Icon, Popup, Typography } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, MouseEvent, useCallback, useState } from "react";

import { Project as ProjectType } from "../../../type";

import useProjectEditors, { Editor } from "./useProjectEditors";

type Props = {
  project: ProjectType;
};

const ProjectEditorInfo: FC<Props> = ({ project }) => {
  const t = useT();
  const theme = useTheme();
  const { creator, lastEditor, updatedRelative, updatedAtFull, createdAtFull } =
    useProjectEditors(project);

  // The card opens/selects on click, so interacting with the info icon must
  // not leak through to it.
  const stopPropagation = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Wrapper data-testid={`project-editor-info-${project.name}`}>
      {lastEditor && (
        <>
          <EditorBadge editor={lastEditor} />
          <Dot />
        </>
      )}
      {updatedRelative && (
        <>
          <MetaText>{`${t("Updated")} ${updatedRelative}`}</MetaText>
          <Dot />
        </>
      )}
      <Popup
        trigger={
          <InfoIconWrapper
            onClick={stopPropagation}
            data-testid={`project-editor-info-trigger-${project.name}`}
          >
            <Icon
              icon="informationCircle"
              size={12}
              color={theme.content.weak}
            />
          </InfoIconWrapper>
        }
        placement="bottom"
        offset={16}
        triggerOnHover
      >
        <TipPanel
          onClick={stopPropagation}
          data-testid={`project-editor-info-tooltip-${project.name}`}
        >
          <Row>
            <Typography size="body">{t("Last updated by")}</Typography>
            {lastEditor ? <EditorBadge editor={lastEditor} strong /> : "-"}
          </Row>
          <Row>
            <Typography color="#E0E0E0" size="body">
              {t("Last updated")}
            </Typography>
            <Typography size="body">{updatedAtFull ?? "-"}</Typography>
          </Row>
          <Divider />
          <Row>
            <Typography size="body">{t("Created by")}</Typography>
            {creator ? <EditorBadge editor={creator} strong /> : "-"}
          </Row>
          <Row>
            <Typography size="body">{t("Created")}</Typography>
            <Typography size="body">{createdAtFull ?? "-"}</Typography>
          </Row>
        </TipPanel>
      </Popup>
    </Wrapper>
  );
};

export const EditorBadge: FC<{
  editor: Editor;
  strong?: boolean;
  textColor?: string;
}> = ({ editor, strong, textColor }) => {
  const [failedURL, setFailedURL] = useState<string>();
  const showImage = !!editor.avatarURL && editor.avatarURL !== failedURL;
  const initial = editor.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Badge>
      <Avatar>
        {showImage ? (
          <AvatarImage
            src={editor.avatarURL}
            alt={editor.name}
            onError={() => setFailedURL(editor.avatarURL)}
          />
        ) : (
          <AvatarInitial>{initial}</AvatarInitial>
        )}
      </Avatar>
      {strong || textColor ? (
        <Typography
          color={textColor}
          size="body"
          otherProperties={{
            overflow: css.overflow.hidden,
            textOverflow: css.textOverflow.ellipsis,
            whiteSpace: css.whiteSpace.nowrap
          }}
        >
          {editor.name}
        </Typography>
      ) : (
        <MetaText>{editor.name}</MetaText>
      )}
    </Badge>
  );
};

export default ProjectEditorInfo;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  height: "16px",
  minWidth: 0
}));

const MetaText = styled("span")(({ theme }) => ({
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.footnote,
  lineHeight: "16px",
  whiteSpace: css.whiteSpace.nowrap,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis
}));

const Dot = styled("span")(({ theme }) => ({
  width: "2px",
  height: "2px",
  borderRadius: "50%",
  background: theme.content.weak,
  flexShrink: 0
}));

const Badge = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest,
  minWidth: 0
}));

const Avatar = styled("div")(({ theme }) => ({
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  background: theme.bg[2],
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  flexShrink: 0,
  overflow: css.overflow.hidden
}));

const AvatarImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: css.objectFit.cover
});

const AvatarInitial = styled("span")(({ theme }) => ({
  color: theme.content.main,
  fontSize: "9px",
  lineHeight: 1
}));

const InfoIconWrapper = styled("div")(() => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  cursor: css.cursor.pointer
}));

const TipPanel = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small,
  padding: theme.spacing.small,
  backgroundColor: theme.bg[3],
  boxShadow: theme.shadow.tooltip,
  borderRadius: theme.radius.normal,
  minWidth: "250px"
}));

const Row = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.spaceBetween,
  gap: theme.spacing.super
}));

const Divider = styled("div")(({ theme }) => ({
  height: "1px",
  background: theme.bg[4]
}));

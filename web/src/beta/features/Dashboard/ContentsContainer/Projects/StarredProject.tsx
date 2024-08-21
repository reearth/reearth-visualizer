import { FC } from "react";

import { Collapse, Icon } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { Project } from "../../type";

type StarredProjectProps = {
  projects?: Project[];
};

const StarredProject: FC<StarredProjectProps> = () => {
  const t = useT();
  const theme = useTheme();
  return (
    <Wrapper>
      <Collapse iconPosition="left" title={t("Starred")} size="small" weight="bold">
        <ProjectsWrapper>
          <Item>
            <IconWrapper icon="notebook" color={theme.content.weak} />
            <TitleWrapper>Project A</TitleWrapper>
          </Item>

          <Item>
            <IconWrapper icon="notebook" color={theme.content.weak} />
            <TitleWrapper>Project B</TitleWrapper>
          </Item>
        </ProjectsWrapper>
      </Collapse>
    </Wrapper>
  );
};

export default StarredProject;

const Wrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
}));

const ProjectsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  paddingLeft: theme.spacing.small,
  height: "300px",
}));

const Item = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  padding: theme.spacing.small,
  alignItems: "center",
  alignSelf: "stretch",
}));
const IconWrapper = styled(Icon)(() => ({
  flexShrink: 0,
}));
const TitleWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

import { FC } from "react";

import { Button, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { Workspace } from "../../type";

import { List } from "./List";

export const Members: FC<{ currentWorkspace?: Workspace }> = ({ currentWorkspace }) => {
  const t = useT();
  return (
    <Wrapper>
      <Search>
        <TextInputWrapper>
          <TextInput value="" placeholder={t("Use Name or Email")} />
        </TextInputWrapper>
        <Button icon="magnifyingGlass" title={t("Find Member")} size="small" />
      </Search>
      <ProjectsWrapper>
        <ListWrapper>
          {currentWorkspace?.members?.map(member => (
            <List key={member.userId} member={member} />
          ))}
        </ListWrapper>
      </ProjectsWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.large,
  width: "100%",
  height: "100%",
}));

const Search = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing.normal,
  width: "40%",
}));

const TextInputWrapper = styled("div")(() => ({
  flex: 1,
}));

const ProjectsWrapper = styled("div")(() => ({
  overflow: "auto",
  width: "100%",
}));

const ListWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.normal,
  flexDirection: "column",
  overflow: "auto",
}));

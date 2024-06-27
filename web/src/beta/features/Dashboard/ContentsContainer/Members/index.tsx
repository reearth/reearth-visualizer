import { FC } from "react";

import { Button, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { Workspace } from "../../type";

import ListItem from "./ListItem";

const Members: FC<{ currentWorkspace?: Workspace }> = ({ currentWorkspace }) => {
  const t = useT();
  return (
    <Wrapper>
      <Search>
        <TextInputWrapper>
          <TextInput value="" placeholder={t("Use Name or Email")} />
        </TextInputWrapper>
        <Button icon="magnifyingGlass" title={t("Find Member")} size="small" />
      </Search>
      <ListWrapper>
        {currentWorkspace?.members?.map(member => (
          <ListItem key={member.userId} member={member} />
        ))}
      </ListWrapper>
    </Wrapper>
  );
};

export default Members;

const Wrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "100%",
  height: "100%",
}));

const Search = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing.normal,
  width: "40%",
  padding: theme.spacing.largest,
}));

const TextInputWrapper = styled("div")(() => ({
  flex: 1,
}));

const ListWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  padding: `0 ${theme.spacing.largest}px ${theme.spacing.largest}px ${theme.spacing.largest}px`,
  display: "flex",
  gap: theme.spacing.normal,
  flexDirection: "column",
  overflow: "auto",
  boxSizing: "border-box",
}));

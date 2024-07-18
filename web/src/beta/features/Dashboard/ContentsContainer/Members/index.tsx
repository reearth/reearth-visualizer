import { FC, useEffect, useState } from "react";

import { Button, TextInput, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { Workspace } from "../../type";

import ListItem from "./ListItem";

const Members: FC<{ currentWorkspace?: Workspace }> = ({ currentWorkspace }) => {
  const t = useT();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredMembers, setFilteredMembers] = useState<Workspace["members"] | null>(null);

  const handleMemberSearch = () => {
    if (!currentWorkspace?.members) {
      return;
    }

    const filtered = currentWorkspace.members.filter(
      member =>
        member?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredMembers(filtered);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (value === "" && currentWorkspace?.members) setFilteredMembers(currentWorkspace.members);
  };

  useEffect(() => {
    if (currentWorkspace?.members) {
      setFilteredMembers(currentWorkspace.members);
    }
  }, [currentWorkspace]);

  return (
    <Wrapper>
      <Search>
        <TextInput
          value={searchQuery}
          extendWidth
          onChange={handleSearchInputChange}
          placeholder={t("Use Name or Email")}
        />
        <Button
          icon="magnifyingGlass"
          title={t("Find Member")}
          size="small"
          onClick={handleMemberSearch}
        />
      </Search>
      <ListWrapper>
        {filteredMembers && filteredMembers?.length > 0 ? (
          filteredMembers?.map(member => <ListItem key={member.userId} member={member} />)
        ) : (
          <TemplateWrapper>
            <Typography size="body">{t("No Member match your search.")}</Typography>
          </TemplateWrapper>
        )}
      </ListWrapper>
    </Wrapper>
  );
};

export default Members;

const Wrapper = styled("div")(() => ({
  display: "grid",
  gridTemplateRows: "auto 1fr",
  boxSizing: "border-box",
  height: "100%",
}));

const Search = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing.super,
  width: "max-content",
  padding: theme.spacing.largest,
  "@media (min-width: 650px)": {
    maxWidth: "550px",
    gridTemplateColumns: "2fr 1fr",
  },
}));

const ListWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  overflowY: "auto",
  boxSizing: "border-box",
  padding: `0 ${theme.spacing.largest}px ${theme.spacing.largest}px ${theme.spacing.largest}px`,
}));

const TemplateWrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "70vh",
}));

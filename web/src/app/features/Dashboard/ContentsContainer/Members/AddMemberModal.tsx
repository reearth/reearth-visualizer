import {
  Button,
  Icon,
  IconButton,
  Modal,
  ModalPanel,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useMeFetcher, useWorkspaceFetcher } from "@reearth/services/api";
import { Role } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { Workspace } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "react-use";

type AddMemberModalProps = {
  workspace: Workspace | undefined;
  visible: boolean;
  onClose: () => void;
};

const AddMemberModal: FC<AddMemberModalProps> = ({
  workspace,
  visible,
  onClose
}) => {
  const t = useT();
  const theme = useTheme();
  const { useSearchUser } = useMeFetcher();

  const [userNotFoundWarningVisible, setUserNotFoundWarningVisible] =
    useState(false);
  const [userExistsWarningVisible, setUserExistsWarningVisible] =
    useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  const [searchResult, setSearchResult] = useState<
    { id: string; name: string; email: string }[]
  >([]);

  const { user, loading } = useSearchUser(debouncedSearchTerm, {
    skip: !debouncedSearchTerm
  });

  const existingMemberIdsRef = useRef<string[]>([]);
  existingMemberIdsRef.current =
    workspace?.members
      ?.map((m) => m.user?.id)
      ?.filter((id) => id !== undefined) ?? [];

  useEffect(() => {
    setUserNotFoundWarningVisible(!user);
    const alreadyExists =
      !!user && existingMemberIdsRef.current.includes(user.id);
    setUserExistsWarningVisible(alreadyExists);
    if (user && !alreadyExists) {
      setSearchResult((prev) =>
        prev.find((u) => u.id === user.id)
          ? prev
          : [
              ...prev,
              {
                id: user.id,
                name: user.name,
                email: user.email
              }
            ]
      );
    }
  }, [user]);

  const { useAddMemberToWorkspace: addMember } = useWorkspaceFetcher();

  const handleAddMembersToWorkspace = useCallback(async () => {
    if (searchResult.length === 0 || !workspace?.id) return;
    for (const user of searchResult) {
      await addMember({
        teamId: workspace.id,
        userId: user.id,
        role: Role.Reader
      });
    }
    onClose();
  }, [searchResult, workspace, addMember, onClose]);

  const handleRemoveUserFromSearchResult = useCallback((userId: string) => {
    setSearchResult((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  return (
    <Modal visible={visible} size="small">
      <ModalPanel
        title={t("Add a team member")}
        layout="common"
        onCancel={onClose}
        actions={[
          <Button
            key="cancel"
            title={t("Cancel")}
            appearance="secondary"
            onClick={onClose}
          />,
          <Button
            key="add"
            title={t("Add")}
            appearance="primary"
            onClick={handleAddMembersToWorkspace}
          />
        ]}
      >
        <Typography size="body">
          {t("Search by email address or user name")}
        </Typography>
        <TextInput
          placeholder="name@reearth.io"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        {userNotFoundWarningVisible && debouncedSearchTerm && !loading && (
          <Warning>
            <Icon icon="warning" size="large" color={theme.warning.main} />
            <Typography size="body" color="warning">
              {t("Can't find the user")}
            </Typography>
          </Warning>
        )}
        {userExistsWarningVisible && !loading && (
          <Warning>
            <Icon icon="warning" size="large" color={theme.warning.main} />
            <Typography size="body" color="warning">
              {t("User already joined this workspace.")}
            </Typography>
          </Warning>
        )}
        {searchResult.map((user) => (
          <ItemContainer key={user.id}>
            <UserInfo>
              <Typography size="body">{user.name}</Typography>
              <Typography size="body" color="weak">
                {user.email}
              </Typography>
            </UserInfo>
            <IconButton
              appearance="simple"
              icon="trash"
              onClick={() => handleRemoveUserFromSearchResult(user.id)}
            />
          </ItemContainer>
        ))}
      </ModalPanel>
    </Modal>
  );
};

export default AddMemberModal;

const ItemContainer = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `0 ${theme.spacing.normal}px`,
  fontSize: theme.fonts.sizes.body
}));

const UserInfo = styled("div")({
  display: "flex",
  flexDirection: "column"
});

const Warning = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.normal,
  color: theme.warning.main
}));

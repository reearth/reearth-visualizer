import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  TextInput,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { CommonField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

type Prop = {
  isStory?: boolean;
  alias?: string;
  aliasValid?: boolean;
  domain?: string;
  onClose?: () => void;
  onSubmit?: (alias?: string) => void;
  onCheckAlias?: (alias?: string) => Promise<void>;
};

const EditPanel: FC<Prop> = ({
  alias,
  isStory,
  aliasValid,
  domain,
  onClose,
  onSubmit,
  onCheckAlias
}) => {
  const t = useT();
  const theme = useTheme();

  const [localAlias, setLocalAlias] = useState("");
  const [warning, setWaring] = useState(false);

  const handleChange = useCallback(
    async (value: string) => {
      onCheckAlias?.(value);
      if (value === alias) {
        setWaring(!aliasValid);
      } else setWaring(false);
      setLocalAlias(value);
    },
    [alias, aliasValid, onCheckAlias]
  );

  const handleSubmit = useCallback(() => {
    onSubmit?.(localAlias);
    onClose?.();
  }, [localAlias, onClose, onSubmit]);

  return (
    <Modal visible size="small">
      <ModalPanel
        title={t("Edit Alias")}
        onCancel={onClose}
        actions={
          <ButtonWrapper>
            <Button extendWidth title={t("Cancel")} onClick={onClose} />
            <Button
              extendWidth
              title={t("Apply")}
              appearance="primary"
              disabled={warning || !localAlias}
              onClick={handleSubmit}
            />
          </ButtonWrapper>
        }
      >
        <Wrapper>
          <Typography size="body">
            {isStory
              ? t(
                  "You are about to change the alias for your story. Only alphanumeric characters and hyphens are allows."
                )
              : t(
                  "You are about to change the alias for your project. Only alphanumeric characters and hyphens are allows."
                )}
          </Typography>
          <CommonField title={"Alias"}>
            <InputWrapper>
              <Typography size="body" color={theme.content.weak}>
                {"https://"}
              </Typography>
              <TextInput value={localAlias} onBlur={handleChange} />
              <Typography size="body" color={theme.content.weak}>
                {`.${domain}`}
              </Typography>
            </InputWrapper>
          </CommonField>

          <WarningMessage>
            {warning ? (
              <>
                <Icon icon="close" />
                <Typography size="footnote" color={theme.dangerous.main}>
                  {t(
                    "The name is already taken by other users. Please choose a different name."
                  )}
                </Typography>
              </>
            ) : (
              ""
            )}
          </WarningMessage>
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

export default EditPanel;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.normal
}));

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.micro
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: theme.spacing.small
}));

const WarningMessage = styled("div")(({ theme }) => ({
  color: theme.dangerous.main,
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center"
}));

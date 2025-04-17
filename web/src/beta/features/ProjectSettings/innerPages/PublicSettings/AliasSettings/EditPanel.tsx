import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  TextInput,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { CommonField } from "@reearth/beta/ui/fields";
import { useProjectFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

type Prop = {
  publicUrl: string;
  isStory?: boolean;
  alias?: string;
  onClose?: () => void;
  onSubmit?: (alias?: string) => void;
};

const EditPanel: FC<Prop> = ({
  alias,
  isStory,
  publicUrl,
  onClose,
  onSubmit
}) => {
  const t = useT();
  const theme = useTheme();
  const { checkAlias } = useProjectFetcher();

  const domainUrl = useMemo(() => {
    const match = publicUrl.match(/^https?:\/\/([^/]+)/);
    return match?.[1] ?? "";
  }, [publicUrl]);

  const [localAlias, setLocalAlias] = useState("");
  const [warning, setWaring] = useState(false);

  const handleChange = useCallback(
    async (value: string) => {
      const result = await checkAlias?.(value);
      if (value === alias) {
        setWaring(!result?.available);
      } else setWaring(false);
      setLocalAlias(value);
    },
    [alias, checkAlias]
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
                {domainUrl && `.${domainUrl}`}
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

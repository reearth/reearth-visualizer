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

  const [prefix, suffix] = useMemo(() => {
    if (!publicUrl) return ["", ""];
    const aliasMatch = publicUrl.match(/^(https?:\/\/[^?]+)\?alias=/);
    if (aliasMatch) {
      return [aliasMatch[1] + "?alias=", ""];
    }

    const subdomainMatch = publicUrl.match(/^https?:\/\/([^\\.]+)\.(.+)$/);
    if (subdomainMatch) {
      return ["https://", "." + subdomainMatch[2]];
    }

    return ["", ""];
  }, [publicUrl]);

  const [localAlias, setLocalAlias] = useState(alias);
  const [warning, setWaring] = useState("");
  const [isAliasValid, setIsAliasValid] = useState(true);

  const handleChange = useCallback((value: string) => {
    setLocalAlias(value);
    setWaring("");
    setIsAliasValid(false);
  }, []);

  const handleBlur = useCallback(
    async (value: string) => {
      if (/^(project-|story-)/.test(value)) {
        setWaring(t("Alias cannot start with 'project-' or 'story-'"));
        return;
      }

      const result = await checkAlias?.(value);
      if (!result?.available) {
        const description = result?.errors?.find(
          (e) => !!e.description
        )?.description;

        setWaring(description as string);
        setIsAliasValid(false);
      } else {
        setWaring("");
        setIsAliasValid(true);
      }
    },
    [checkAlias, t]
  );

  const isDisabled = useMemo(
    () => !!warning || localAlias === alias || !isAliasValid,
    [alias, localAlias, warning, isAliasValid]
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
              disabled={isDisabled}
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
            <InputWrapper hasSuffix={!!suffix}>
              {prefix && (
                <Typography size="body" color={theme.content.weak}>
                  {prefix}
                </Typography>
              )}
              <TextInput
                value={localAlias}
                onBlur={handleBlur}
                onChange={handleChange}
              />
              {suffix && (
                <Typography size="body" color={theme.content.weak}>
                  {suffix}
                </Typography>
              )}
            </InputWrapper>
          </CommonField>

          <WarningMessage>
            {warning ? (
              <>
                <Icon icon="close" />
                <Typography size="footnote" color={theme.dangerous.main}>
                  {warning}
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

const InputWrapper = styled("div")<{ hasSuffix?: boolean }>(
  ({ theme, hasSuffix }) => ({
    display: "flex",
    flexDirection: hasSuffix ? "row" : "column",
    alignItems: hasSuffix ? "center" : undefined,
    gap: theme.spacing.micro
  })
);

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

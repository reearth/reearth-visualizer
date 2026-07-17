import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { CommonField } from "@reearth/app/ui/fields";
import { useValidateSceneAlias } from "@reearth/services/api/scene";
import { useValidateStoryAlias } from "@reearth/services/api/storytelling";
import { useT } from "@reearth/services/i18n/hooks";
import { keyframes, styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { debounce } from "lodash-es";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { extractPrefixSuffix } from "../../../hooks";

type Prop = {
  publicUrl: string;
  isStory?: boolean;
  alias?: string;
  itemId?: string;
  onClose?: () => void;
  onSubmit?: (alias?: string) => void;
};

type AliasStatus = "idle" | "loading" | "success" | "error";

const EditPanel: FC<Prop> = ({
  alias,
  isStory,
  publicUrl,
  itemId,
  onClose,
  onSubmit
}) => {
  const t = useT();
  const theme = useTheme();
  const { validateSceneAlias } = useValidateSceneAlias();
  const { validateStoryAlias } = useValidateStoryAlias();

  const [prefix, suffix] = useMemo(
    () => extractPrefixSuffix(publicUrl),
    [publicUrl]
  );

  const [localAlias, setLocalAlias] = useState(alias);
  const [warning, setWaring] = useState("");
  const [isAliasValid, setIsAliasValid] = useState(true);
  const [aliasValidating, setAliasValidating] = useState(false);

  const handleAliasValidation = useCallback(
    async (value: string) => {
      const result = isStory
        ? await validateStoryAlias(value, itemId)
        : await validateSceneAlias?.(value, itemId);

      setAliasValidating(false);

      if (!result?.available) {
        const description = result?.errors?.find(
          (e) => e?.extensions?.description
        )?.extensions?.description;

        setWaring(description as string);
        setIsAliasValid(false);
      } else {
        setWaring("");
        setIsAliasValid(true);
      }
    },
    [validateSceneAlias, validateStoryAlias, isStory, itemId]
  );

  const debouncedHandleAliasValidation = useMemo(
    () => debounce((value: string) => handleAliasValidation(value), 500),
    [handleAliasValidation]
  );

  useEffect(() => {
    return () => debouncedHandleAliasValidation.cancel();
  }, [debouncedHandleAliasValidation]);

  const handleChange = useCallback(
    (value: string) => {
      setLocalAlias(value);
      setWaring("");
      setIsAliasValid(false);
      if (value.trim() && value.trim() !== alias) {
        setAliasValidating(true);
      } else {
        setAliasValidating(false);
      }
      debouncedHandleAliasValidation(value);
    },
    [alias, debouncedHandleAliasValidation]
  );

  const isDisabled = useMemo(
    () => !!warning || localAlias === alias || !isAliasValid || aliasValidating,
    [alias, localAlias, warning, isAliasValid, aliasValidating]
  );

  const aliasStatus: AliasStatus = useMemo(() => {
    if (!localAlias?.trim() || localAlias === alias) return "idle";
    if (aliasValidating) return "loading";
    if (isAliasValid) return "success";
    if (warning) return "error";
    return "idle";
  }, [localAlias, alias, aliasValidating, isAliasValid, warning]);

  const aliasStatusIcon = useMemo(() => {
    if (aliasStatus === "loading") return <Spinner />;
    if (aliasStatus === "success")
      return <Icon icon="check" size={14} color={theme.success.main} />;
    if (aliasStatus === "error")
      return <Icon icon="close" size={14} color={theme.dangerous.main} />;
    return null;
  }, [aliasStatus, theme]);

  const handleSubmit = useCallback(() => {
    onSubmit?.(localAlias);
    onClose?.();
  }, [localAlias, onClose, onSubmit]);

  return (
    <Modal visible size="small">
      <ModalPanel
        title={t("Edit Alias")}
        onCancel={onClose}
        actions={[
          <Button
            key="cancel"
            title={t("Cancel")}
            appearance="secondary"
            onClick={onClose}
          />,
          <Button
            key="apply"
            title={t("Apply")}
            appearance="primary"
            disabled={isDisabled}
            onClick={handleSubmit}
          />
        ]}
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
          <CommonField
            title={"Alias"}
            description={
              !warning ? (
                <Typography size="footnote" color={theme.content.weak}>
                  {`${t("Only letters, numbers, and hyphens are allowed. Example: https://reearth.io/team-alias/")}${localAlias || "project-alias"}`}
                </Typography>
              ) : undefined
            }
          >
            <InputWrapper hasSuffix={!!suffix}>
              {prefix && (
                <Typography size="body" color={theme.content.weak}>
                  {prefix}
                </Typography>
              )}
              <TextInputStatusWrapper $status={aliasStatus}>
                <TextInput
                  value={localAlias}
                  onChange={handleChange}
                  actions={aliasStatusIcon ? [aliasStatusIcon] : undefined}
                />
              </TextInputStatusWrapper>
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

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled("div")(({ theme }) => ({
  width: 14,
  height: 14,
  borderRadius: "50%",
  border: `2px solid ${theme.outline.weak}`,
  borderTopColor: theme.content.main,
  animation: `${spin} 0.7s linear infinite`,
  flexShrink: 0
}));

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.large,
  padding: theme.spacing.normal
}));

const InputWrapper = styled("div")<{ hasSuffix?: boolean }>(
  ({ theme, hasSuffix }) => ({
    display: css.display.flex,
    flexDirection: hasSuffix ? "row" : "column",
    alignItems: hasSuffix ? "center" : undefined,
    gap: theme.spacing.micro
  })
);

const TextInputStatusWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "$status"
})<{ $status: AliasStatus }>(({ theme, $status }) => ({
  flex: 1,
  "& > div": {
    ...($status === "error" && {
      border: `1px solid ${theme.dangerous.main}`
    })
  }
}));

const WarningMessage = styled("div")(({ theme }) => ({
  color: theme.dangerous.main,
  display: css.display.flex,
  gap: theme.spacing.small,
  alignItems: css.alignItems.center
}));

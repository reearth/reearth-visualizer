import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  TextInput,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { CommonField } from "@reearth/beta/ui/fields";
import {
  useProjectFetcher,
  useStorytellingFetcher
} from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { extractPrefixSuffix } from "../../../hooks";

type Prop = {
  publicUrl: string;
  isStory?: boolean;
  alias?: string;
  itemId?: string;
  onClose?: () => void;
  onSubmit?: (alias?: string) => void;
};

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
  const { checkProjectAlias } = useProjectFetcher();
  const { checkStoryAlias } = useStorytellingFetcher();

  const [prefix, suffix] = useMemo(
    () => extractPrefixSuffix(publicUrl),
    [publicUrl]
  );

  const [localAlias, setLocalAlias] = useState(alias);
  const [warning, setWaring] = useState("");
  const [isAliasValid, setIsAliasValid] = useState(true);

  const handleChange = useCallback((value: string) => {
    setLocalAlias(value);
    setWaring("");
    setIsAliasValid(false);
  }, []);

  const handleBlur = useCallback(async () => {
    const alias = localAlias as string;
    const result = isStory
      ? await checkStoryAlias(alias, itemId)
      : await checkProjectAlias?.(alias, itemId);

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
  }, [checkProjectAlias, checkStoryAlias, isStory, itemId, localAlias]);

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

const WarningMessage = styled("div")(({ theme }) => ({
  color: theme.dangerous.main,
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center"
}));

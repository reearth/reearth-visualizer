import { useState, useEffect, useCallback, useMemo } from "react";

import { useAuth } from "@reearth/auth";
import { Status as StatusType } from "@reearth/components/atoms/PublicationStatus";
import generateRandomString from "@reearth/util/generate-random-string";

export type Validation = "too short" | "not match";

export type Status = StatusType;

export default (
  defaultAlias?: string,
  loading?: boolean,
  publicationStatus?: Status,
  validAlias?: boolean,
  validatingAlias?: boolean,
  onAliasValidate?: (alias: string) => void,
  onPublish?: (alias: string | undefined, publicationStatus: Status) => void | Promise<void>,
) => {
  const { getAccessToken } = useAuth();
  const url = window.REEARTH_CONFIG?.published?.split("{}");
  const extensions = window.REEARTH_CONFIG?.extensions?.publication;

  const [alias, setAlias] = useState(defaultAlias);
  const [validation, setValidation] = useState<Validation>();
  const [showDModal, setDModal] = useState(false);
  const [accessToken, setAccessToken] = useState<string>();

  const handleAliasValidate = useCallback(
    (a?: string) => {
      if (!a) {
        setValidation(undefined);
        return;
      }
      if (a.length < 5) {
        setValidation("too short");
      } else if (!/^[A-Za-z0-9_-]*$/.test(a)) {
        setValidation("not match");
      } else {
        setValidation(undefined);
        onAliasValidate?.(a);
      }
    },
    [onAliasValidate],
  );

  const handleGenerateAlias = useCallback(() => {
    const str = generateRandomString(15);
    setAlias(str);
    return str;
  }, []);

  const handleAliasChange = useCallback(
    (value?: string) => {
      const a = value || handleGenerateAlias();
      setAlias(a);
      handleAliasValidate(a);
    },
    [handleAliasValidate], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const purl = useMemo(() => {
    return (url?.[0] ?? "") + (defaultAlias?.replace("/", "") ?? "") + (url?.[1] ?? "");
  }, [url, defaultAlias]);

  const handleCopyToClipBoard = useCallback(
    (value: string | undefined) => () => {
      if (!value) return;
      navigator.clipboard.writeText(value);
    },
    [],
  );

  const handlePublish = useCallback(async () => {
    if (!publicationStatus) {
      setDModal(false);
      return;
    }
    await onPublish?.(alias, publicationStatus);
    setDModal(false);
  }, [alias, onPublish, publicationStatus]);

  const publishDisabled = useMemo(
    () =>
      loading ||
      publicationStatus === "unpublished" ||
      (publicationStatus === "published" &&
        (!alias || !!validation || validatingAlias || !validAlias)),
    [alias, validation, validAlias, validatingAlias, publicationStatus, loading],
  );

  const handleDomainModalClose = useCallback(() => {
    handleAliasChange(defaultAlias);
    setDModal(false);
  }, [defaultAlias, handleAliasChange]);

  useEffect(() => {
    setAlias(defaultAlias);
    handleAliasValidate(defaultAlias);
  }, [defaultAlias, handleAliasValidate]);

  useEffect(() => {
    getAccessToken().then(token => {
      setAccessToken(token);
    });
  }, [getAccessToken]);

  return {
    alias,
    extensions,
    accessToken,
    url,
    purl,
    showDModal,
    publishDisabled,
    handlePublish,
    handleDomainModalClose,
    setDModal,
    handleAliasChange,
    handleCopyToClipBoard,
  };
};

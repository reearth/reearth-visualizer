import { useState, useEffect, useCallback } from "react";

import { publishingType } from "@reearth/classic/components/molecules/EarthEditor/Header/index";
import generateRandomString from "@reearth/classic/util/generate-random-string";

export type PublishStatus = "published" | "limited" | "unpublished";

export type Validation = "too short" | "not match";
export type CopiedItemKey = {
  url?: boolean;
  embedCode?: boolean;
};

export default (
  publishing?: publishingType,
  publishStatus?: PublishStatus,
  defaultAlias?: string,
  onPublish?: (alias: string | undefined, publishStatus: PublishStatus) => void | Promise<void>,
  onClose?: () => void,
  onAliasValidate?: (alias: string) => void,
  onCopyToClipBoard?: () => void,
) => {
  const [copiedKey, setCopiedKey] = useState<CopiedItemKey>();
  const [alias, changeAlias] = useState(defaultAlias);
  const [validation, changeValidation] = useState<Validation>();
  const [statusChanged, setStatusChange] = useState(false);
  const [showOptions, setOptions] = useState(!defaultAlias);
  const [searchIndex, setSearchIndex] = useState(false);

  useEffect(() => {
    setSearchIndex(!!(publishStatus === "published"));
  }, [publishStatus]);

  const handleSearchIndexChange = useCallback(() => {
    setSearchIndex(!searchIndex);
  }, [searchIndex]);

  const handleCopyToClipBoard = useCallback(
    (key: keyof CopiedItemKey, value: string | undefined) => () => {
      if (!value) return;
      setCopiedKey(prevState => ({
        ...prevState,
        [key]: true,
      }));
      navigator.clipboard.writeText(value);
      onCopyToClipBoard?.();
    },
    [onCopyToClipBoard],
  );

  const validate = useCallback(
    (a?: string) => {
      if (!a) {
        changeValidation(undefined);
        return;
      }
      if (a.length < 5) {
        changeValidation("too short");
      } else if (!/^[A-Za-z0-9_-]*$/.test(a)) {
        changeValidation("not match");
      } else {
        changeValidation(undefined);
        onAliasValidate?.(a);
      }
    },
    [onAliasValidate],
  );

  const onAliasChange = useCallback(
    (value?: string) => {
      const a = value || generateAlias();
      changeAlias(a);
      validate(a);
    },
    [validate], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleClose = useCallback(() => {
    onClose?.();
    setTimeout(() => {
      onAliasChange(defaultAlias);
      setStatusChange(false);
      setOptions(defaultAlias ? false : true);
    }, 500);
  }, [onClose, defaultAlias]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateAlias = useCallback(() => {
    const str = generateRandomString(10);
    changeAlias(str);
    return str;
  }, []);

  useEffect(() => {
    onAliasChange(defaultAlias);
  }, [defaultAlias]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePublish = useCallback(async () => {
    if (!publishing) return;
    const a = publishing !== "unpublishing" ? alias || generateAlias() : undefined;

    const mode =
      publishing === "unpublishing" ? "unpublished" : !searchIndex ? "limited" : "published";
    await onPublish?.(a, mode);
    if (publishing === "unpublishing") {
      handleClose?.();
    } else {
      setStatusChange(true);
    }
  }, [alias, generateAlias, onPublish, publishing, searchIndex, setStatusChange, handleClose]);

  return {
    statusChanged,
    alias,
    validation,
    copiedKey,
    showOptions,
    searchIndex,
    handlePublish,
    handleClose,
    handleCopyToClipBoard,
    handleSearchIndexChange,
    setOptions,
  };
};

import { useState, useEffect, useCallback } from "react";

import generateRandomString from "@reearth/util/generate-random-string";

export type Validation = "too short" | "not match";

export default (defaultAlias?: string, onAliasValidate?: (alias: string) => void) => {
  const [alias, changeAlias] = useState(defaultAlias);
  const [validation, changeValidation] = useState<Validation>();

  const handleCopyToClipBoard = useCallback(
    (value: string | undefined) => () => {
      if (!value) return;
      navigator.clipboard.writeText(value);
    },
    [],
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

  const generateAlias = useCallback(() => {
    const str = generateRandomString(15);
    changeAlias(str);
    return str;
  }, []);

  const onAliasChange = useCallback(
    (value?: string) => {
      const a = value || generateAlias();
      changeAlias(a);
      validate(a);
    },
    [validate], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    changeAlias(defaultAlias);
    validate(defaultAlias);
  }, [defaultAlias, validate]);

  return {
    alias,
    onAliasChange,
    validation,
    handleCopyToClipBoard,
  };
};

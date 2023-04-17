import { useCallback, useEffect, useState } from "react";

import { useT } from "@reearth/i18n";

import { PasswordPolicy as PasswordPolicyType } from "../common";

export type PasswordPolicy = PasswordPolicyType;

export default function ({
  onSignup,
  passwordPolicy,
}: {
  onSignup: (info: { email: string; username: string; password: string }) => Promise<void>;
  passwordPolicy?: PasswordPolicyType;
}) {
  const t = useT();
  const [regexMessage, setRegexMessage] = useState<string | undefined | null>();
  const [username, setUsername] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [disabled, setDisabled] = useState(true);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      !email ||
      !username ||
      !password ||
      (passwordPolicy?.highSecurity && !passwordPolicy.highSecurity.test(password)) ||
      passwordPolicy?.tooShort?.test(password) ||
      passwordPolicy?.tooLong?.test(password)
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [email, username, password, passwordPolicy]);

  const handleUsernameInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setUsername(newValue);
    },
    [],
  );
  const handleEmailInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setEmail(newValue);
    },
    [],
  );
  const handlePasswordInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const password = e.currentTarget.value;
      setPassword(password);
      switch (true) {
        case passwordPolicy?.whitespace?.test(password):
          setRegexMessage(t("No whitespace is allowed."));
          break;
        case passwordPolicy?.tooShort?.test(password):
          setRegexMessage(t("Too short."));
          break;
        case passwordPolicy?.tooLong?.test(password):
          setRegexMessage(t("That is terribly long."));
          break;
        case passwordPolicy?.highSecurity?.test(password):
          setRegexMessage(t("That password is great!"));
          break;
        case passwordPolicy?.medSecurity?.test(password):
          setRegexMessage(t("That password is better."));
          break;
        case passwordPolicy?.lowSecurity?.test(password):
          setRegexMessage(t("That password is okay."));
          break;
        default:
          setRegexMessage(t("That password confuses me, but might be okay."));
          break;
      }
    },
    [password], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSignup = useCallback(async () => {
    if (!email || !username || !password) return;
    setLoading(true);
    try {
      await onSignup({ email, username, password });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }, [email, username, password, onSignup]);

  return {
    regexMessage,
    disabled,
    sent,
    loading,
    email,
    username,
    password,
    handleUsernameInput,
    handleEmailInput,
    handlePasswordInput,
    handleSignup,
  };
}

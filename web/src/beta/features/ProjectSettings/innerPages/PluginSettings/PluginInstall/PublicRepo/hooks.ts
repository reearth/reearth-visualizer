import { useCallback, useState } from "react";

export const validateUrl = (url: string): { result: boolean; message: string } => {
  if (!url) {
    return { result: false, message: "Error: Thie field is required" };
  }
  if (!/https:\/\/github\.com\/([\w-_%]|\.)+/.test(url)) {
    return { result: false, message: "Error: Invalid GitHub repository URL" };
  }
  return { result: true, message: "" };
};

export default (onSend: (repoUrl: string) => void, loading?: boolean) => {
  const [isOpen, open] = useState(false);
  const [validationErr, setValidationErr] = useState("");
  const [repoUrl, setRepoUrl] = useState<string>();
  const handleOpen = () => open(true);

  const handleClose = useCallback(() => {
    if (!loading) {
      open(false);
      setRepoUrl(undefined);
      setValidationErr("");
    }
  }, [loading]);

  const handleSubmit = useCallback(() => {
    const { result: success, message } = validateUrl(repoUrl ?? "");
    setValidationErr(message);
    if (!success) return;
    onSend(repoUrl ?? "");
    handleClose();
  }, [handleClose, onSend, repoUrl]);

  return {
    isOpen,
    validationErr,
    repoUrl,
    handleRepoUrlChange: setRepoUrl,
    handleOpen,
    handleSubmit,
    handleClose,
  };
};

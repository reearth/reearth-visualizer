import React from "react";

import PasswordResetMolecule from "@reearth/components/molecules/Authentication/PasswordReset";

export type Props = {
  onPasswordResetRequest?: (email?: string) => any;
  onNewPasswordSubmit?: (newPassword?: string, email?: string, token?: string) => Promise<void>;
};

const PasswordReset: React.FC<Props> = ({ onPasswordResetRequest }) => {
  return <PasswordResetMolecule onPasswordResetRequest={onPasswordResetRequest} />;
};

export default PasswordReset;

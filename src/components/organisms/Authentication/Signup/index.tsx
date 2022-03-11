import React from "react";

import SignupMolecule, {
  PasswordPolicy,
} from "@reearth/components/molecules/Authentication/Signup";

export type Props = {
  onSignup: (email?: string, username?: string, password?: string) => any;
  passwordPolicy?: PasswordPolicy;
};

const Signup: React.FC<Props> = ({ onSignup, passwordPolicy }) => {
  return <SignupMolecule onSignup={onSignup} passwordPolicy={passwordPolicy} />;
};

export default Signup;

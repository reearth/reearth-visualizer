import React from "react";

import LoginMolecule from "@reearth/components/molecules/Authentication/Login";

export type Props = {
  onLogin: (username: string, password: string) => void;
};

const Login: React.FC<Props> = ({ onLogin }) => {
  return <LoginMolecule onLogin={onLogin} />;
};

export default Login;

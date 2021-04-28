import React from "react";
import { Provider as ReduxProvider } from "react-redux";

import { store } from "./store";

const Provider: React.FC = ({ children }) => {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
};

export default Provider;

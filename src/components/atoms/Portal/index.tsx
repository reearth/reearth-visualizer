import React, { ReactNode, useLayoutEffect } from "react";
import ReactDOM from "react-dom";

const Portal: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [node, setNode] = React.useState<HTMLElement>();

  useLayoutEffect(() => {
    setNode(document.body);
  }, []);

  return node ? ReactDOM.createPortal(children, node) : null;
};

export default Portal;

import { ReactNode, useLayoutEffect, useState } from "react";
import ReactDOM from "react-dom";

const Portal: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [node, setNode] = useState<HTMLElement>();

  useLayoutEffect(() => {
    setNode(document.body);
  }, []);

  return node ? ReactDOM.createPortal(children, node) : null;
};

export default Portal;

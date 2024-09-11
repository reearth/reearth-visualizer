import { FC, ReactNode } from "react";

const Marker: FC<{ dynamicContent: ReactNode }> = ({ dynamicContent }) => {
  return dynamicContent;
};

export default Marker;

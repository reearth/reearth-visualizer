import React from "react";

export type Props = {
  className?: string;
};

const PrivateRepo: React.FC<Props> = ({ className }) => {
  return <div className={className}>private</div>;
};

export default PrivateRepo;

import { FC } from "react";

import { DataProps } from "..";

const WmsTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  console.log(sceneId, onSubmit, onClose);
  return <div>WmsTiles</div>;
};

export default WmsTiles;

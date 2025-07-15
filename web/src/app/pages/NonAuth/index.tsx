import NonAuth from "@reearth/app/features/NonAuth";
import { FC } from "react";

import Page from "../Page";

const NonAuthPage: FC = () => {
  return <Page renderItem={() => <NonAuth />} />;
};

export default NonAuthPage;

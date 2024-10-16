import NotFound from "@reearth/beta/features/NotFound";
import { FC } from "react";

import Page from "../Page";

const NotFoundPage: FC = () => {
  return <Page renderItem={() => <NotFound />} />;
};

export default NotFoundPage;

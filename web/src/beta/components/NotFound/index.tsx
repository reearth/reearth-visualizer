import React from "react";

import { useT } from "@reearth/services/i18n";

const NotFound: React.FC = () => {
  const t = useT();
  return <div>{t("Notfound")}</div>;
};

export default NotFound;

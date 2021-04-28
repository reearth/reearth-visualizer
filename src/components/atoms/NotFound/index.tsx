import React from "react";
import { useIntl } from "react-intl";

const NotFound: React.FC = () => {
  const intl = useIntl();
  return <div>{intl.formatMessage({ defaultMessage: "Notfound" })}</div>;
};

export default NotFound;
